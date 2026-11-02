import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Account, AccountDescriptionRespModel } from '@modules/accounts/models';
import { AccountsResponseModel } from '@modules/accounts/models/accounts-response.model';
import { Merchant } from '@modules/auth/models/merchant.model';
import { AuthService } from '@modules/auth/services';
import { MerchantListResponseModel } from '@modules/merchant/models/merchant-list-response.model';
import { SortDirection } from '@modules/transactions/directives';
import { TransactionResponseModel } from '@modules/transactions/models/transaction-response.model';
import { SESSION_STORAGE, StorageService } from 'ngx-webstorage-service';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { RazorpayResponseModel } from '../models/razorpay-response.model';
import {
  InputSourceAccount,
  SourceAccountResponse
} from '../models/source-account-validation.model';
import banksTypes from '../constants/banksTypes';

interface SearchResult {
  account: Account[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  selectedAccount: string;
  selectedAccounts: string[];
  sortColumn: string;
  sortDirection: SortDirection;
}

@Injectable()
export class AccountsService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  public _searchTerm = '';
  private _searchUrl = '';
  public merchantId = '';
  private _status = '';
  private _transferTo = 'bankAccount';
  private bank = '';
  private _account$ = new BehaviorSubject<Account[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private accounts: Account[] = [];
  public isAuto?: boolean;
  private _merchant$ = new BehaviorSubject<Merchant[]>([]);
  private _searchMerchant$ = new Subject<void>();
  hardEscrowAccountNumber = '';

  project = [
    'email',
    'accountId',
    'ifsc',
    'status',
    'name',
    'createdAt',
    'balance',
    'createdBy',
    'expectedVolume',
    'purpose',
    'startDate',
    'validity',
    'shareUnit',
    'bank',
    'hardEscrowAccountNumber',
    'vpa'
  ];

  private _selectedAccountBalance = -1;

  private _fieldUpdates$ = new Subject<void>();
  public isAdmin = false;

  private _state: State = {
    page: 1,
    pageSize: 8,
    searchTerm: '',
    sortColumn: '',
    selectedAccount: '',
    selectedAccounts: [],
    sortDirection: ''
  };

  private reportDownloadLink$ = new BehaviorSubject('#');

  constructor(
    private pipe: DecimalPipe,
    private httpClient: HttpClient,
    @Inject(SESSION_STORAGE) private storageService: StorageService,
    private authService: AuthService
  ) {
    // Handle field updates
    this._fieldUpdates$.subscribe(() => {
      // Update the balance for the selected account
      // this._selectedAccountBalance = this.account$.?.balance;
      try {
        const vAs = this._account$
          .getValue()
          .filter(
            account =>
              account.accountId.localeCompare(this.selectedAccount) === 0
          );
        this._selectedAccountBalance = vAs[0].balance;
      } catch (e) {}
      console.log('state updated, balance: ' + this._selectedAccountBalance);
      console.log(this._state);
    });

    // Handle fetching entries callback
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(120),
        switchMap(() => this._search()),
        delay(120),
        tap(() => this._loading$.next(false))
      )
      .subscribe(result => {
        try {
          this._account$.next(result.result);
          //if(result.allItemsCount > 0){
          this._total$.next(result.allItemsCount);
          //}else{
          //this._total$.next(0);
          //}
          this.updateReportDownloadLink();
        } catch (e) {
          console.error(e);
        }
      });

    // this._search$.next();

    this._searchMerchant$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(120),
        switchMap(() => this._searchMerchant()),
        delay(120),
        tap(() => this._loading$.next(false))
      )
      .subscribe(resp => {
        this._merchant$.next(resp.result || []);
      });

    this.isAdmin = this.authService.isSuperAdmin();
  }

  performSearch(status: string = '', transferTo: string = '', bank = '') {
    this.page = -1;
    this._status = status;
    this._transferTo = transferTo;
    if (bank) {
      if (bank.toLowerCase() === 'yes') {
        bank = banksTypes.YES_BANK;
      }
      this.bank = bank.toLowerCase();
    }
    this._search$.next();
  }

  /*
    ToDo : resolve the function
  */
  performReset() {
    this._account$.next([]);
    this._total$.next(0);
  }

  updateReportDownloadLink() {
    // tslint:disable-next-line:no-any
    const params: any = { token: this.authService.getBearerToken() };

    if (this.searchTerm.length > 0) params.s = this.searchTerm;

    if (this.hardEscrowAccountNumber)
      params.hardEscrowAccountNumber = this.hardEscrowAccountNumber;

    let paramsSerialized = '';

    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }

    const newLink = this.isAdmin
      ? environment.apiPrefix +
      '/super-admin/account/report/download?' +
      paramsSerialized
      : environment.apiPrefix + '/account/report/download?' + paramsSerialized;

    if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Link
    this.reportDownloadLink$.next(newLink);
  }

  addAccount(accountData: FormData, merchantId = '') {
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });

    let url = environment.apiPrefix + `/account`;
    if (this.isAdmin) {
      url = environment.apiPrefix + `/super-admin/account`;
      // Object.assign(accountData, { merchantId });
      accountData.set('merchantId', merchantId);
    }
    return this.httpClient.post<AccountDescriptionRespModel>(url, accountData);
  }

  //Deposits Amount into VA
  depositAmount(depositData: FormData) {
    let url = environment.apiPrefix + `/transaction/test`;
    if (this.isAdmin) {
      url = environment.apiPrefix + `/super-admin/transaction`;
    }
    return this.httpClient.post<TransactionResponseModel>(url, depositData);
  }

  updateAccount(
    accountId: string = '',
    accountData: FormData,
    merchantId = ''
  ) {
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });

    let url = environment.apiPrefix + `/account/${accountId}`;
    if (this.isAdmin) {
      url =
        environment.apiPrefix +
        `/super-admin/account/${accountId}?merchantId=${merchantId}`;
      // Object.assign(accountData, { merchantId });
      // accountData.set('merchantId', merchantId);
    }
    return this.httpClient.patch<AccountDescriptionRespModel>(url, accountData);
  }

  addData(account: Account) {
    try {
      this.accounts = JSON.parse(this.storageService.get('accounts'));
      if (typeof this.accounts === 'undefined' || this.accounts.length === 0) {
        this.accounts = [];
      }
      // else {
      //   this.accounts = JSON.parse(this.accounts);
      // }
    } catch (e) {
      this.accounts = [];
    }

    this.accounts.push(account);

    this.storageService.set('accounts', JSON.stringify(this.accounts));
  }

  getMerchants(term: string) {
    this._searchTerm = term;
    if (this.authService.isSuperAdmin()) {
      const apiPath = '/super-admin/merchant';
      this._searchUrl = environment.apiPrefix + apiPath;
      this._searchMerchant$.next();
    }
  }

  get search$() {
    return this._search$;
  }

  get account$() {
    return this._account$.asObservable();
  }

  get selectedAccount() {
    return this._state.selectedAccount;
  }

  set selectedAccount(selectedAccount: string) {
    this._set({ selectedAccount });
  }

  get total$() {
    return this._total$.asObservable();
  }

  get loading$() {
    return this._loading$.asObservable();
  }

  get page() {
    return this._state.page;
  }

  set page(page: number) {
    this._set({ page });
    this._search$.next();
  }

  get pageSize() {
    return this._state.pageSize;
  }

  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }

  get searchTerm() {
    return this._state.searchTerm;
  }

  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }

  set selectedAccountBalance(balance: number) {
    this._selectedAccountBalance = balance;
  }

  set sortColumn(sortColumn: string) {
    this._set({ sortColumn });
  }

  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  get merchant$() {
    return this._merchant$.asObservable();
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._fieldUpdates$.next();
  }

  checkActiveInactive(value: string): string {
    let time = new Date(value);
    let currentTime = new Date();
    if (
      currentTime.getTime() >= time.getTime() ||
      time.getDate() === currentTime.getDate()
    ) {
      return 'Active';
    } else {
      return 'InActive';
    }
  }

  private _search(): Observable<AccountsResponseModel> {
    let url = environment.apiPrefix + '/account';
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Prepare Params
    // tslint:disable-next-line:no-any
    const params: any = { page: this.page, _project: this.project };
    if (this._status) {
      Object.assign(params, { status: this._status });
    }

    if (this.hardEscrowAccountNumber) {
      Object.assign(params, {
        hardEscrowAccountNumber: this.hardEscrowAccountNumber
      });
    }

    if (this._transferTo) {
      Object.assign(params, { type: this._transferTo });
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    if (this.isAuto !== undefined && !this.isAdmin) {
      params.isAutoTransfer = this.isAuto;
    } else if (this.isAuto !== undefined && this.isAdmin) {
      params.isAuto = this.isAuto;
    }

    if (this.isAdmin) {
      if (this.merchantId) {
        params.merchantId = this.merchantId;
      }
      params.page = -1;
      url = environment.apiPrefix + '/super-admin/account';
    }

    if (this.bank) {
      if (this.bank === 'YES' || this.bank === 'yes') {
        this.bank = banksTypes.YES_BANK;
      }
      params.bank = this.bank.toLowerCase();
    }

    return this.httpClient
      .get<AccountsResponseModel>(url, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          if (resp.success) {
            try {
              this.accounts = resp.result;
              if (
                typeof this.accounts === 'undefined' ||
                this.accounts.length === 0
              ) {
                this.accounts = [];
              }

              /**
               * Process data
               */
              // this.accounts.forEach(it => {
              //   if (
              //     it.status.toLowerCase() !== 'closed' &&
              //     it.status.toLowerCase() !== 'inactive'
              //   ) {
              //     it.status = this.checkActiveInactive(it.startDate.toString());
              //   }
              // });
              // this.accounts.filter(item => {
              //   item.startDate = new Date(item.startDate);
              //
              //   return item;
              // });
              resp.result = this.accounts;
            } catch (e) {
              console.error(e);
              // req.errors = [e.message];
            }
          }
          return resp;
        }),
        catchError(err => {
          console.error(err);

          // Disable the Loading text before returning anything
          // this._loading$.next(false);

          return throwError(err);
        })
      );
  }

  public createRzpOrder = (
    amount: number,
    currency: string,
    merchantId: string
  ): Observable<RazorpayResponseModel> => {
    const apiPath = '/razorpay/orders';
    const body = {
      amount: amount,
      currency: currency,
      merchantId: merchantId
    };

    return this.httpClient.post<RazorpayResponseModel>(
      environment.apiPrefix + apiPath,
      body
    );
  };

  getMerchant(accountId: string, term: string, merchantId = '') {
    this._searchTerm = term;
    this._searchUrl = `${environment.apiPrefix}/account/${accountId}/payee`;

    if (this.isAdmin) {
      this._searchUrl = `${environment.apiPrefix}/super-admin/account/${accountId}/payee?merchantId=${merchantId}`;
    }
    this._searchMerchant$.next();
  }

  public _searchMerchant = (): Observable<MerchantListResponseModel> => {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this._loading$.next(true);

    const params: any = { page: -1 };
    if (this._searchTerm.length > 0) {
      params.s = this._searchTerm;
    }

    const apiPath = this.authService.isSuperAdmin()
      ? '/super-admin/merchant'
      : '/merchant/';

    return this.httpClient.get<MerchantListResponseModel>(
      environment.apiPrefix + apiPath,
      {
        headers: httpHeaders,
        params
      }
    );
  };

  getAccounts(
    merchantId: string | null,
    page: number,
    filters: { hardEscrowAccountNumber?: string[]; bank?: string } = {}
  ) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params: any = { page };
    let url = `${environment.apiPrefix}/account`;

    if (merchantId) {
      params.merchantId = merchantId;
      url = `${environment.apiPrefix}/super-admin/account`;
    }

    // Filters for Getting Accounts
    if (filters) {
      if (
        filters.hardEscrowAccountNumber &&
        filters.hardEscrowAccountNumber.length > 0
      ) {
        params.hardEscrowAccountNumber = JSON.stringify(
          filters.hardEscrowAccountNumber
        );
      }
    }

    return this.httpClient.get<AccountsResponseModel>(url, {
      headers: httpHeaders,
      params
    });
  }

  /**
   * Get QR code string
   * @param accountId
   * @returns
   */
  getQRCode(accountId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/account/${accountId}/qr`;

    return this.httpClient.get<AccountsResponseModel>(url, {
      headers: httpHeaders
    });
  }

  /**
   * Update source Account
   */
  updateSourceAccount(accountId: string, accountData: InputSourceAccount) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let url = `${environment.apiPrefix}/account/${accountId}/source-account`;
    if (this.authService.isSuperAdmin()) {
      url = `${environment.apiPrefix}/super-admin/account/${accountId}/source-account`;
    }
    return this.httpClient.put<SourceAccountResponse>(url, accountData);
  }

  /**
   * Get all source Accounts
   */
  getSourceAccounts(accountId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/account/${accountId}/source-account`;
    if (this.authService.isSuperAdmin()) {
      url = `${environment.apiPrefix}/super-admin/account/${accountId}/source-account`;
    }

    return this.httpClient.get<SourceAccountResponse>(url, {
      headers: httpHeaders
    });
  }

  /**
   *  Enable disable Source Account Validation
   * @param accountId
   * @param sourceAccountValidation
   * @returns
   */
  updateSourceAccountValidation(
    accountId: string,
    sourceAccountValidation: boolean
  ) {
    let url = `${environment.apiPrefix}/account/${accountId}/source-account/activation`;

    if (this.authService.isSuperAdmin()) {
      url = `${environment.apiPrefix}/super-admin/account/${accountId}/source-account/activation`;
    }

    return this.httpClient.put<any>(url, {
      sourceAccountValidation: sourceAccountValidation
    });
  }
}

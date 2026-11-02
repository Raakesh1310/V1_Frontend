import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { Account, AccountDescriptionInput } from '@modules/accounts/models';
import { AccountCreateResponseModel } from '@modules/accounts/models/account-create-response.model';
import { AccountsResponseModel } from '@modules/accounts/models/accounts-response.model';
import { AuthService } from '@modules/auth/services';
import { SortDirection } from '@modules/transactions/directives';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
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
  status: string;
  bank: string;

  /**
   * Date From
   * with MinDate field
   * with MaxDate field
   */
  dateFrom: NgbDateStruct;
  dateFromMin: NgbDateStruct;
  dateFromMax: NgbDateStruct;

  /**
   * Date To
   * with MinDate field
   * with MaxDate field
   */
  dateTo: NgbDateStruct;
  dateToMin: NgbDateStruct;
  dateToMax: NgbDateStruct;

  isAuto: boolean;
}

@Injectable()
export class AccountsAdminService {
  constructor(
    private authService: AuthService,
    private pipe: DecimalPipe,
    private httpClient: HttpClient,
    private dateParser: NgbDateParserService,
    @Inject(SESSION_STORAGE) private storageService: StorageService,
    private calendar: NgbCalendar,
    private utilityService: UtilityService
  ) {
    const dNow = new Date();
    this.dateFromMax = calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.dateToMax = calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );

    // Handle field updates
    this._fieldUpdates$.subscribe(() => {
      // Update the balance for the selected account
      // this._selectedAccountBalance = this.account$.?.balance;
      try {
        // const vAs = this._account$
        //   .getValue()
        //   .filter(
        //     account =>
        //       account.accountId.localeCompare(this.selectedAccount) === 0
        //   );
        // this._selectedAccountBalance = vAs[0].balance;
        this.updateReportDownloadLink();
      } catch (e) {}
      // console.log('state updated, balance: ' + this._selectedAccountBalance);
      // console.log(this._state);
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
          this._total$.next(result.allItemsCount);
        } catch (e) {
          console.error(e);
        }
      });

    // this._search$.next();
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

  get selectedAccountBalance() {
    return this._selectedAccountBalance;
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

  get status() {
    return this._state.status;
  }

  set status(status) {
    console.log(status);
    this._set({ status });
  }

  get bank() {
    return this._state.bank;
  }

  set bank(bank) {
    console.log(bank);
    this._set({ bank });
  }

  get dateFrom() {
    return this._state.dateFrom;
  }

  set dateFrom(dateFrom) {
    this._set({ dateFrom });

    // if (!dateFrom) {
    //   this.dateToMin = this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0);
    // } else {
    this.dateToMin = this.calendar.getNext(
      new NgbDate(this.dateFrom.year, this.dateFrom.month, this.dateFrom.day),
      'd',
      0
    );
    // }
  }

  get dateFromMin() {
    return this._state.dateFromMin;
  }

  set dateFromMin(dateFromMin) {
    this._set({ dateFromMin });
  }

  get dateFromMax() {
    return this._state.dateFromMax;
  }

  set dateFromMax(dateFromMax) {
    this._set({ dateFromMax });
  }

  get dateTo() {
    return this._state.dateTo;
  }

  set dateTo(dateTo) {
    this._set({ dateTo });

    // if (!dateTo) {
    //   this.dateFromMin = this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0);
    // } else {
    this.dateFromMax = this.calendar.getNext(
      new NgbDate(this.dateTo.year, this.dateTo.month, this.dateTo.day),
      'd',
      0
    );
    // }
  }

  get dateToMin() {
    return this._state.dateToMin;
  }

  set dateToMin(dateToMin) {
    this._set({ dateToMin });
  }

  get dateToMax() {
    return this._state.dateToMax;
  }

  get isAuto() {
    return this._state.isAuto;
  }

  set dateToMax(dateToMax) {
    this._set({ dateToMax });
  }

  set selectedAccountBalance(balance: number) {
    this._selectedAccountBalance = balance;
  }

  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }

  set sortColumn(sortColumn: string) {
    this._set({ sortColumn });
  }

  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  set selectedAccount(selectedAccount: string) {
    this._set({ selectedAccount });
  }

  set isAuto(isAuto: boolean) {
    this._set({ isAuto });
  }

  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _account$ = new BehaviorSubject<Account[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private accounts: Account[] = [];
  public merchantId = '';
  public isAdmin = false;

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
    'merchantTitle',
    'merchantId',
    'authorizers',
    'fundsBlocked',
    'isAutoTransfer',
    'retentionAmount',
    'vpa',
    'bank',
    'autoTransferType',
    'autoScheduledAt'
  ];

  private _selectedAccountBalance = -1;

  private reportDownloadLink$ = new BehaviorSubject('#');

  private _fieldUpdates$ = new Subject<void>();

  private _state: State = {
    page: 1,
    pageSize: 8,
    searchTerm: '',
    sortColumn: '',
    selectedAccount: '',
    selectedAccounts: [],
    sortDirection: '',

    /**
     * Date From
     * with MinDate field
     * with MaxDate field
     */
    dateFrom: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    dateFromMin: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    dateFromMax: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),

    /**
     * Date To
     * with MinDate field
     * with MaxDate field
     */
    dateTo: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    dateToMin: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    dateToMax: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),

    status: '',
    bank: '',
    isAuto: false
  };

  setDefault() {
    this.project = [
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
      'merchantTitle',
      'authorizers',
      'fundsBlocked',
      'isAutoTransfer',
      'retentionAmount'
    ];
    this._state = {
      page: 1,
      pageSize: 8,
      searchTerm: '',
      sortColumn: '',
      selectedAccount: '',
      selectedAccounts: [],
      sortDirection: '',

      /**
       * Date From
       * with MinDate field
       * with MaxDate field
       */
      dateFrom: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
      dateFromMin: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
      dateFromMax: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),

      /**
       * Date To
       * with MinDate field
       * with MaxDate field
       */
      dateTo: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
      dateToMin: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
      dateToMax: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),

      status: '',
      bank: '',
      isAuto: false
    };
  }

  performRefresh() {
    this._search$.next();
  }

  performSearch() {
    this.page = 1;
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

    if (this.status.length > 0) params.status = this.status;
    if (this.searchTerm.length > 0) params.s = this.searchTerm;
    if (this.bank.length > 0) params.bank = this.bank;
    if (this.merchantId) params.merchantId = this.merchantId;
    if (this.isAuto) params.isAuto = this.isAuto;

    if (this._state.dateFrom && this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toISOString();
    }

    if (this._state.dateTo && this._state.dateTo.year > 2010) {
      // add a day to dateTo
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }

    let paramsSerialized = '';

    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }

    const newLink =
      environment.apiPrefix +
      '/super-admin/account/report/download?' +
      paramsSerialized;

    if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Link
    this.reportDownloadLink$.next(newLink);
  }

  getAccount(_pId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    // Object.assign(this.project, { feeDetails: 1 });
    const params: any = { _project: [...this.project, 'feeDetails'] };
    const apiPath = this.authService.isSuperAdmin()
      ? '/super-admin/account/'
      : '/account/';

    return this.httpClient
      .get<AccountsResponseModel>(environment.apiPrefix + apiPath + _pId, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  update(accountId: string, body: AccountDescriptionInput, merchantId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });
    let url = `${environment.apiPrefix}/super-admin/account/${accountId}?merchantId=${merchantId}`;
    return this.httpClient.patch<AccountsResponseModel>(url, body);
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._fieldUpdates$.next();
  }

  private _search(): Observable<AccountsResponseModel> {
    console.log('Retrieving Accounts Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Prepare Params
    // tslint:disable-next-line:no-any
    const params: any = { page: this.page, _project: this.project };

    if (this.merchantId) {
      params.merchantId = this.merchantId;
    }

    if (this._state.dateFrom && this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toISOString();
    }

    if (this._state.dateTo && this._state.dateTo.year > 2010) {
      //add a day to dateTo
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }
    if (this._state.status !== '') {
      params.status = this.status;
    }

    if (this._state.bank !== '') {
      params.bank = this.bank;
    }

    params.isAuto = this.isAuto.toString();

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    console.log(params);

    return this.httpClient
      .get<AccountsResponseModel>(
        environment.apiPrefix + '/super-admin/account',
        {
          headers: httpHeaders,
          params
        }
      )
      .pipe(
        map(resp => {
          if (resp.success) {
            console.log(resp);
            try {
              this.accounts = resp.result;
              if (
                typeof this.accounts === 'undefined' ||
                this.accounts.length === 0
              ) {
                this.accounts = [];
              }
              // this._account$.next(this.accounts);
              // this._total$.next(this.accounts.length);
            } catch (e) {
              console.error(e);
              // req.errors = [e.message];
            }
          }

          // Disable the Loading text before returning anything
          // this._loading$.next(false);
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

  public updateSettings = (
    accountId: string,
    updates: object,
    merchantId: string
  ): Observable<AccountsResponseModel> => {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url =
      environment.apiPrefix +
      `/super-admin/account/${accountId}?merchantId=${merchantId}`;
    return this.httpClient.patch<AccountsResponseModel>(url, updates);
  };

  updateStatus<ProfileResponseModel>(_pId: string, status: boolean) {
    // setting header
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });
    const params: any = { _id: _pId, active: status };

    // creating request
    return this.httpClient
      .post<any>(environment.apiPrefix + '/super-admin/account/updateStatus', {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  linkVPA(accountId: string) {
    // setting header
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });

    // creating request
    return this.httpClient.post<any>(
      environment.apiPrefix + '/super-admin/account/' + accountId + '/link-vpa',
      {
        headers: httpHeaders
      }
    );
  }
}

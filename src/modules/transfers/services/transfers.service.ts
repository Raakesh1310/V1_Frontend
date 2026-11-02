import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Account } from '@modules/accounts/models';
import { AuthService } from '@modules/auth/services';
import { TransferResponseModel } from '@modules/passbook/models/transfer-response.model';
import { CreateTransferResponseModel } from '@modules/transfers/models/create-transfer-response.model';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TransferStatusOption } from '../models/transfer-status-option.model';
import { UpdateTransferResponseModel } from '../models/update-transfer-response.model copy';
import banksTypes from '@modules/accounts/constants/banksTypes';

interface SearchResult {
  accounts: Account[];
}

interface State {
  searchTerm: string;
}

@Injectable()
export class TransfersService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _searchUrl = '';
  public _accounts$ = new BehaviorSubject<Account[]>([]);
  public _selectedAccount = {} as Account;
  public _selectedAccountBalance = -1;
  public _accounts = [] as Account[];
  private _total$ = new BehaviorSubject<number>(0);
  private reportDownloadLink$ = new BehaviorSubject('#');

  private _state: State = {
    searchTerm: ''
  };

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {}

  // tslint:disable-next-line:no-any
  findOne = (params: any) => {
    if (!params || !params.transferId) {
      return null;
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const transferId = params.transferId;

    delete params.transferId;
    return this.httpClient.get<TransferResponseModel>(
      environment.apiPrefix + '/transfer/' + transferId,
      {
        headers,
        params
      }
    );
  };

  getTransfers$(): Observable<{}> {
    return of({});
  }

  getScheduledTransfers(page: number, s: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const params: any = { page };

    if (s.length > 0) {
      params.s = s;
    }
    return this.httpClient.get(
      environment.apiPrefix + `/transfer/scheduled/list`,
      {
        headers: httpHeaders,
        params
      }
    );
  }

  stopRecurringTransfer(transferId: string, rejectReason: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.patch(
      environment.apiPrefix + `/transfer/scheduled/${transferId}`,
      { rejectReason }
    );
  }

  scheduleTransferDetails(transferId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.get(
      environment.apiPrefix + `/transfer/scheduled/${transferId}`
    );
  }

  //Update Transfer Status from User side
  updateStatus(
    transferId: string,
    status: string,
    statusOption: TransferStatusOption
  ) {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<UpdateTransferResponseModel>(
      environment.apiPrefix + '/transfer/' + transferId + '/status-test/',
      { status: status, utr: statusOption.utr, remarks: statusOption.remarks },
      { headers: httpHeaders }
    );
  }

  // tslint:disable-next-line:no-any
  addTransferEntry(body: any, isAdmin?: boolean, transferTo: string = '') {
    console.log('Retrieving Accounts');

    // Enable the loading text
    this._loading$.next(true);

    return this.httpClient.post<CreateTransferResponseModel>(
      environment.apiPrefix +
        (isAdmin ? '/' + environment.urlAdminPrefix : '') +
        '/transfer',
      body
    );
    // .pipe(
    //   map(resp => {
    //     this._accounts$.next(resp.result);
    //     this._accounts = resp.result;
    //   }),
    //   catchError(err => {
    //     return throwError(new Error(err));
    //   })
    // );
  }

  // tslint:disable-next-line:no-any
  createUPITransferEntry(
    connectedBanking: boolean = false,
    body: any,
    isAdmin?: boolean
  ) {
    // Enable the loading text
    this._loading$.next(true);

    let url = environment.apiPrefix;
    //  +
    url += isAdmin ? '/' + environment.urlAdminPrefix : '';
    url += connectedBanking ? '/bank-account/transfer/upi' : '/transfer/upi';

    return this.httpClient.post<CreateTransferResponseModel>(url, body);
    // .pipe(
    //   map(resp => {
    //     this._accounts$.next(resp.result);
    //     this._accounts = resp.result;
    //   }),
    //   catchError(err => {
    //     return throwError(new Error(err));
    //   })
    // );
  }

  getAuthorizers(accountId: string, isAdmin?: boolean, merchantId?: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = isAdmin
      ? environment.apiPrefix +
        '/' +
        environment.urlAdminPrefix +
        `/transfer/authorizers/${merchantId}`
      : environment.apiPrefix + '/transfer/authorizers';
    const params: any = { accountId: accountId };

    return this.httpClient.get(url, { headers: httpHeaders, params });
  }

  getBankAccounts(
    merchantId: string = '',
    bank: string = '',
    isAdmin: string = '',
    upi: boolean = false
  ) {
    let params = new HttpParams();
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (upi) {
      params = params.set('upi', 'true');
    }
    if (merchantId) {
      params = params.set('merchantId', merchantId as string);
    }
    if (bank) {
      if (bank === 'yes' || bank === 'YES') {
        bank = banksTypes.YES_BANK;
      }
      params = params.set('bank', bank.toLowerCase());
    }

    let url = isAdmin
      ? environment.apiPrefix +
        '/' +
        environment.urlAdminPrefix +
        `/bank-account`
      : environment.apiPrefix + `/bank-account`;

    return this.httpClient.get(url, { headers: httpHeaders, params });
  }

  getActiveBalance(
    merchantId: string | null,
    bankAccountNo: number,
    bankName: string,
    isAdmin: string = ''
  ) {
    const httpHeaders = new HttpHeaders({
      'content-type': 'application/json'
    });

    let params = new HttpParams();
    params = params.set('merchantId', merchantId as string);
    params = params.set('bankAccountId', (bankAccountNo as unknown) as string);
    params = params.set('bankName', bankName as string);
    let url = environment.apiPrefix + `/bank-account/${bankAccountNo}/balance`;
    if (isAdmin) {
      url =
        environment.apiPrefix +
        `/super-admin/bank-account/${bankAccountNo}/balance`;
    }
    return this.httpClient.get<any>(url, {
      headers: httpHeaders,
      params
    });
  }
}

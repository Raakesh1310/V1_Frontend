import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { Account } from '@modules/accounts/models';
import { AuthService } from '@modules/auth/services';
import { TransfersResponseModel } from '@modules/passbook/models/transfers-response.model';
import { SortDirection } from '@modules/tables/directives';
import { TransferStatusOption } from '@modules/transfers/models/transfer-status-option.model';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Transfer } from '../models';
import { UpdateTransferResponseModel } from '../models/update-transfer-response.model copy';

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;

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

  sortDirection: SortDirection;
  status: string;
  bank: string;
}

@Injectable()
export class TransfersAdminService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _transfers$ = new BehaviorSubject<Transfer[]>([]);
  public _selectedAccount = {} as Account;
  public _selectedAccountBalance = -1;
  public _accounts = [] as Account[];
  private _total$ = new BehaviorSubject<number>(0);
  private transfers: Transfer[] = [];

  project = [
    'transferId',
    'utr',
    'status',
    'amount',
    'ifsc',
    'beneficiaryAccNumber',
    'beneficiaryIFSC',
    'beneficiaryName',
    'beneficiaryBankName',
    'purpose',
    'accountId',
    'payeeId',
    'createdAt',
    'remarks',
    'createdBy',
    'merchantTitle',
    'updatedAt',
    'authorization',
    'merchantId',
    'vpa',
    'bankAccountNumber',
    'transferType'
  ];

  private reportDownloadLink$ = new BehaviorSubject('#');
  private bankTransferDownloadLink$ = new BehaviorSubject('#');
  private fieldUpdates = new Subject<void>();

  private _state: State = {
    searchTerm: '',
    pageSize: 10,
    sortColumn: '',
    page: 1,
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
    bank: ''
  };

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private dateParser: NgbDateParserService,
    private calendar: NgbCalendar,
    private utilityService: UtilityService
  ) {
    // Update Date field limitations
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

    this.fieldUpdates.subscribe(() => {
      // Update the download report link
      this.updateReportDownloadLink();
      this.updateBankTransferDownloadLink();
    });

    // this._search$.next();
  }

  getTransfers$(): Observable<{}> {
    return of({});
  }

  fetchTransfer(transferId: string, token: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // tslint:disable-next-line:no-any
    const params: any = { token };

    if (this.project) {
      params._project = this.project;
    }

    console.log(params);

    return this.httpClient.get<TransfersResponseModel>(
      environment.apiPrefix + '/transfer/' + transferId,
      {
        headers: httpHeaders,
        params
      }
    );
  }

  fetchBulkTransfer(batchId: string, token: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // tslint:disable-next-line:no-any
    const params: any = { token };

    // if (this.project) {
    //   params._project = this.project;
    // }

    console.log(params);

    return this.httpClient.get<TransfersResponseModel>(
      environment.apiPrefix + '/multi-transfer/' + batchId,
      {
        headers: httpHeaders,
        params
      }
    );
  }

  retrieveData() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // tslint:disable-next-line:no-any
    const params: any = { page: this.page };

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
    if (this._state.status !== '') {
      params.status = this.status;
    }

    if (this._state.bank !== '') {
      params.bank = this.bank;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    if (this.project) {
      params._project = this.project;
    }

    console.log(params);

    return this.httpClient
      .get<TransfersResponseModel>(
        environment.apiPrefix + '/super-admin/transfer',
        {
          headers: httpHeaders,
          params
        }
      )
      .pipe(
        map(resp => {
          console.log(resp);
          if (resp.success) {
            // console.log(resp);
            try {
              this.transfers = resp.result;
              if (
                typeof this.transfers === 'undefined' ||
                this.transfers.length === 0
              ) {
                this.transfers = [];
              }
              this._transfers$.next(this.transfers);
              this._total$.next(resp.allItemsCount);
            } catch (e) {
              console.error(e);
              // req.errors = [e.message];
            }
          }

          // Disable the Loading text before returning anything
          this._loading$.next(false);
          return resp;
        }),
        catchError(err => {
          console.error(err);

          // Disable the Loading text before returning anything
          this._loading$.next(false);

          return throwError(err);
        })
      );
  }

  retrieveBankTransfers(page: number = 1) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // tslint:disable-next-line:no-any
    const params: any = { page };

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
    if (this._state.status !== '') {
      params.status = this.status;
    }

    if (this._state.bank !== '') {
      params.bank = this.bank;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    if (this.project) {
      params._project = this.project;
    }

    console.log(params);

    return this.httpClient
      .get<TransfersResponseModel>(
        environment.apiPrefix + '/super-admin/transfer/bank-account-transfer',
        {
          headers: httpHeaders,
          params
        }
      )
      .pipe(
        map(resp => {
          console.log(resp);
          if (resp.success) {
            // console.log(resp);
            try {
              this.transfers = resp.result;
              if (
                typeof this.transfers === 'undefined' ||
                this.transfers.length === 0
              ) {
                this.transfers = [];
              }
              this._transfers$.next(this.transfers);
              this._total$.next(resp.allItemsCount);
            } catch (e) {
              console.error(e);
              // req.errors = [e.message];
            }
          }

          // Disable the Loading text before returning anything
          this._loading$.next(false);
          return resp;
        }),
        catchError(err => {
          console.error(err);

          // Disable the Loading text before returning anything
          this._loading$.next(false);

          return throwError(err);
        })
      );
  }

  get transfers$() {
    return this._transfers$.asObservable();
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
    this.retrieveData().subscribe();
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

  set sortColumn(sortColumn: string) {
    this._set({ sortColumn });
  }

  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
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

  set dateToMax(dateToMax) {
    this._set({ dateToMax });
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

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this.fieldUpdates.next();
    this._search$.next();
  }

  updateReportDownloadLink() {
    // tslint:disable-next-line:no-any
    const params: any = {
      token: this.authService.getBearerToken(),
      page: this.page
    };

    if (this._state.dateFrom && this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toISOString();
    }

    if (this._state.dateTo && this._state.dateTo.year > 2010) {
      // add a day to new
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }
    if (this._state.status !== '') {
      params.status = this.status;
    }

    if (this._state.bank !== '') {
      params.bank = this.bank;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
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
      '/super-admin/transfer/report/download?' +
      paramsSerialized;

    if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Link
    this.reportDownloadLink$.next(newLink);
  }

  updateBankTransferDownloadLink() {
    // tslint:disable-next-line:no-any
    const params: any = {
      token: this.authService.getBearerToken(),
      page: this.page
    };

    if (this._state.dateFrom && this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toISOString();
    }

    if (this._state.dateTo && this._state.dateTo.year > 2010) {
      // add a day to new
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }
    if (this._state.status !== '') {
      params.status = this.status;
    }

    if (this._state.bank !== '') {
      params.bank = this.bank;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
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
      '/super-admin/transfer/bank-transfers/download?' +
      paramsSerialized;

    if (!paramsSerialized || this.bankTransferDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Link
    this.bankTransferDownloadLink$.next(newLink);
  }

  updateTransfer(transfer: Transfer) {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<UpdateTransferResponseModel>(
      environment.apiPrefix + '/super-admin/transfer',
      { transfer },
      { headers: httpHeaders }
    );
  }

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
      environment.apiPrefix +
      '/super-admin/transfer/' +
      transferId +
      '/status/' +
      status,
      { utr: statusOption.utr, remarks: statusOption.remarks },
      { headers: httpHeaders }
    );
  }

  approve(transferId: string, verificationId: string, token: string) {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.patch(
      `${environment.apiPrefix}/${transferId}/authorization/${verificationId}/action/approve?token=${token}`,
      {},
      { headers: httpHeaders }
    );
  }

  approveBulkTransfer(batchId: string, verificationId: string, token: string) {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.patch(
      `${environment.apiPrefix}/multi-transfer/${batchId}/authorization/${verificationId}/action/approve?token=${token}`,
      {},
      { headers: httpHeaders }
    );
  }

  reject(
    transferId: string,
    verificationId: string,
    token: string,
    msg: string
  ) {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = { rejectMessage: msg };

    return this.httpClient.patch(
      `${environment.apiPrefix}/${transferId}/authorization/${verificationId}/action/reject?token=${token}`,
      body,
      { headers: httpHeaders }
    );
  }

  rejectBulkTransfer(
    batchId: string,
    verificationId: string,
    token: string,
    msg: string
  ) {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = { rejectMessage: msg };

    return this.httpClient.patch(
      `${environment.apiPrefix}/multi-transfer/${batchId}/authorization/${verificationId}/action/reject?token=${token}`,
      body,
      { headers: httpHeaders }
    );
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
      environment.apiPrefix + `/super-admin/transfer/scheduled/list`,
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
      environment.apiPrefix + `/super-admin/transfer/scheduled/${transferId}`,
      { rejectReason: rejectReason }
    );
  }

  scheduleTransferDetails(transferId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.get(
      environment.apiPrefix + `/super-admin/transfer/scheduled/${transferId}`
    );
  }
}

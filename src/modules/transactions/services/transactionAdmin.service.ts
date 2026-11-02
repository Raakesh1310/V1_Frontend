import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, PipeTransform } from '@angular/core';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { Account } from '@modules/accounts/models';
import { AuthService } from '@modules/auth/services';
import { SortDirection } from '@modules/transactions/directives';
import { Transaction } from '@modules/transactions/models';
import { TransactionsResponseModel } from '@modules/transactions/models/transactions-response.model';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import { environment } from '../../../environments/environment';

interface State {
  page: number;
  pageSize: number;

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

  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
  transactionId: string;
  accountId: string;
}

@Injectable()
export class TransactionAdminService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _transaction$ = new BehaviorSubject<Transaction[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  // Download report link with default link addr #
  private reportDownloadLink$ = new BehaviorSubject('#');
  private fieldUpdates = new Subject<void>();

  private transactions: Transaction[] = [];
  private _accountIds$ = new BehaviorSubject<string[]>([]);
  private accountIds: string[] = [];

  project = [
    'status',
    'transactionId',
    'date',
    'paymentMode',
    'remitterAccNumber',
    'remitterIFSCCode',
    'remitterName',
    'utr',
    'accountId',
    'status',
    'amount',
    'createdAt',
    'merchantTitle'
  ];

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',

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

    sortColumn: '',
    sortDirection: '',
    transactionId: '',
    accountId: ''
  };

  constructor(
    private httpClient: HttpClient,
    private dateParser: NgbDateParserService,
    private calendar: NgbCalendar,
    private authService: AuthService
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

    // Handle the field update
    this.fieldUpdates.subscribe(() => {
      // Update the download report link
      this.updateReportDownloadLink();
    });
    this._search$.next();
  }

  // Trigger the Search for entries

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
      params.dateTo = new Date(
        this.dateParser.format(this._state.dateTo)
      ).toISOString();
    }
    if (this._state.transactionId !== '') {
      params.transactionId = this.transactionId;
    }
    if (this._state.accountId !== '') {
      params.accountId = this.accountId;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    return this.httpClient
      .get<TransactionsResponseModel>(
        environment.apiPrefix + '/super-admin/transaction',
        {
          headers: httpHeaders,
          params
        }
      )
      .pipe(
        map(resp => {
          // console.log(resp);
          if (resp.success) {
            // console.log(resp);
            try {
              this.transactions = resp.result;
              if (
                typeof this.transactions === 'undefined' ||
                this.transactions.length === 0
              ) {
                this.transactions = [];
              }
              this._transaction$.next(this.transactions);
              this._total$.next(this.transactions.length);
            } catch (e) {
              console.error(e);
              // req.errors = [e.message];
            }
          } else {
            this._transaction$.next([]);
          }

          // Disable the Loading text before returning anything
          this._loading$.next(false);
          return resp;
        }),
        // tslint:disable-next-line:no-any
        catchError((err: any) => {
          console.error(err);

          // Disable the Loading text before returning anything
          this._loading$.next(false);

          return throwError(err);
        })
      );
  }

  performReset() {
    this._transaction$.next([]);
    this._total$.next(0);
  }

  get transaction$() {
    return this._transaction$.asObservable();
  }

  get getVirtualIdList$() {
    return this._accountIds$.asObservable();
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
    // console.log('page click: ' + page);
    this._set({ page });
    this._search$.next();
    // this.retrieveData().subscribe();
  }

  get pageSize() {
    return this._state.pageSize;
  }

  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }

  get transactionId() {
    return this._state.transactionId;
  }

  set transactionId(transactionId: string) {
    this._set({ transactionId });
  }

  get searchTerm() {
    return this._state.searchTerm;
  }

  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }

  get accountId() {
    return this._state.accountId;
  }

  set accountId(accountId: string) {
    this._set({ accountId });
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

  set sortColumn(sortColumn: string) {
    this._set({ sortColumn });
  }

  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this.fieldUpdates.next();
  }

  updateReportDownloadLink() {
    // tslint:disable-next-line:no-any
    const params: any = { token: this.authService.getBearerToken() };

    if (this._state.dateFrom && this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toISOString();
    }

    if (this._state.dateTo && this._state.dateTo.year > 2010) {
      params.dateTo = new Date(
        this.dateParser.format(this._state.dateTo)
      ).toISOString();
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
      '/super-admin/transaction/report/download?' +
      paramsSerialized;

    if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Links
    this.reportDownloadLink$.next(newLink);
  }

  getSearchDrowpdownValues() {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient
      .get<TransactionsResponseModel>(
        environment.apiPrefix +
          '/super-admin/transaction/getSearchDropdownValues',
        {
          headers: httpHeaders
        }
      )
      .pipe(
        map(resp => {
          console.log(resp.success);
          if (resp) {
            try {
              this.accountIds = resp.result as string[];
              if (
                typeof this.accountIds === 'undefined' ||
                this.accountIds.length === 0
              ) {
                this.accountIds = [];
              }
              this._accountIds$.next(this.accountIds);
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
}

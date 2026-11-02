import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { AuthService } from '@modules/auth/services';
import { SortDirection } from '@modules/transactions/directives';
import { Transaction } from '@modules/transactions/models';
import { TransactionResponseModel } from '@modules/transactions/models/transaction-response.model';
import { TransactionsResponseModel } from '@modules/transactions/models/transactions-response.model';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
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

interface State {
  page: number;
  pageSize: number;
  account: string;
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

  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
}

@Injectable()
export class TransactionService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _searchUrl = '';
  private _transaction$ = new BehaviorSubject<Transaction[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

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
    'merchantTitle',
    'remarks',
    'merchantId',
    'createdAtString'
  ];

  // Download report link with default link addr #
  private reportDownloadLink$ = new BehaviorSubject('#');
  private fieldUpdates = new Subject<void>();
  public isSuperAdmin = false;

  // private

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    account: '',
    bank: '',

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
    sortDirection: ''
  };

  constructor(
    private pipe: DecimalPipe,
    private httpClient: HttpClient,
    private dateParser: NgbDateParserService,
    private calendar: NgbCalendar,
    private authService: AuthService,
    private utilityService: UtilityService
  ) {
    // Update Date field limitations
    this.isSuperAdmin = authService.isSuperAdmin();
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

    // Handle Search the transactions
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(120),
        switchMap(() => this._search()),
        delay(120),
        tap(() => this._loading$.next(false))
      )
      .subscribe((txResponse: TransactionsResponseModel) => {
        console.log('Refreshing Transaction list.. with the following data');
        console.log(txResponse);

        this._transaction$.next(txResponse.result || []);
        this._total$.next(txResponse.allItemsCount);

        console.log(this._total$.getValue());
      });

    this._search$.next();
  }

  // Trigger the Search for entries

  performSearch() {
    this.page = 1;
    this._searchUrl = environment.apiPrefix + '/transaction';

    this._search$.next();
  }

  // tslint:disable-next-line:no-any
  findOne = (params: any) => {
    if (!params || !params.transactionId) {
      return null;
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const transactionId = params.transactionId;

    delete params.transactionId;
    let url = environment.apiPrefix + '/transaction/' + transactionId;
    if (this.isSuperAdmin) {
      url =
        environment.apiPrefix +
        '/' +
        environment.urlAdminPrefix +
        '/transaction/' +
        transactionId;
    }
    return this.httpClient.get<TransactionResponseModel>(url, {
      headers,
      params
    });
  };

  performRefreshSuperAdmin() {
    this._searchUrl = environment.apiPrefix + '/super-admin/transaction';
    this._search$.next();
  }

  performSearchSuperAdmin() {
    this.page = 1;
    this._searchUrl = environment.apiPrefix + '/super-admin/transaction';
    this._search$.next();
  }

  // getIFSCData(ifscCode: string) {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json'
  //   });

  //   const url = environment.apiPrefix + '/payee/ifsc/' + ifscCode;
  //   return this.httpClient.get<any>(url, {
  //     headers
  //   });
  // }

  performReset() {
    this._transaction$.next([]);
    this._total$.next(0);
  }

  updateReportDownloadLink() {
    // tslint:disable-next-line:no-any
    const params: any = { token: this.authService.getBearerToken() };

    if (this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toISOString();
    }

    if (this._state.dateTo.year > 2010) {
      // add a date to dateTo
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }

    if (this._state.account.length > 0) {
      params.accountId = this._state.account;
    }

    if (this._state.bank !== '') {
      params.bank = this.bank;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
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

    let newLink = '';
    if (this.isSuperAdmin) {
      newLink =
        environment.apiPrefix +
        '/super-admin/transaction/report/download?' +
        paramsSerialized;
    } else {
      newLink =
        environment.apiPrefix +
        '/transaction/report/download?' +
        paramsSerialized;
    }

    if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Link
    this.reportDownloadLink$.next(newLink);
  }

  get transaction$() {
    return this._transaction$.asObservable();
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

  get searchTerm() {
    return this._state.searchTerm;
  }

  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }

  get account() {
    return this._state.account;
  }

  set account(account: string) {
    this._set({ account });
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

    this.dateFromMax = this.calendar.getNext(
      new NgbDate(this.dateTo.year, this.dateTo.month, this.dateTo.day),
      'd',
      0
    );
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
  }

  private _search(): Observable<TransactionsResponseModel> {
    console.log('Retrieving Transaction Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // Prepare Params
    // tslint:disable-next-line:no-any
    const params: any = { page: this.page, _project: this.project };

    if (this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toUTCString();
    }

    if (this._state.dateTo.year > 2010) {
      // add one day to dateTo
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toUTCString();
    }

    if (this._state.account.length > 0) {
      params.accountId = this._state.account;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    if (this._state.bank !== '') {
      params.bank = this.bank;
    }

    console.log(params);

    return this.httpClient
      .get<TransactionsResponseModel>(this._searchUrl, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          if (resp.success) {
            try {
              // Update the entries
              resp.result.filter((transaction: Transaction) => {
                if (transaction.date > 0) {
                  transaction.dateParsed = new Date(transaction.date * 1000);
                }
                return transaction;
              });
            } catch (e) {
              console.error(e);
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

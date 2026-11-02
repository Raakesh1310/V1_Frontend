import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { AuthService } from '@modules/auth/services';
import { TransfersResponseModel } from '@modules/passbook/models/transfers-response.model';
import { SortDirection } from '@modules/transactions/directives';
import { TransactionsResponseModel } from '@modules/transactions/models/transactions-response.model';
import { Transfer } from '@modules/transfers/models';
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
  status: string;
}

@Injectable()
export class PassbookService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _transfers$ = new BehaviorSubject<Transfer[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  // Download report link with default link addr #
  private reportDownloadLink$ = new BehaviorSubject('#');
  private fieldUpdates = new Subject<void>();
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
    'updatedAt',
    'authorization',
    'createdAtString',
    'updatedAtString',
    'vpa',
    'bankAccountNumber',
    'customerRefId',
    'transferType'
  ];

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    account: '',

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

    status: ''
  };
  connectedBanking: boolean = false;

  constructor(
    private pipe: DecimalPipe,
    private httpClient: HttpClient,
    private dateParser: NgbDateParserService,
    private calendar: NgbCalendar,
    private authService: AuthService,
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
        console.log('Refreshing Transfer list.. with the following data');
        console.log(txResponse);
        // txResponse.result.forEach((it : any) => {
        //   it.status = "Sent for Processing";
        // });
        this._transfers$.next(txResponse.result || []);
        this._total$.next(txResponse.allItemsCount);
      });

    this._search$.next();
  }

  // Trigger the Search for entries
  performSearch(page: number = 1) {
    this.page = page;
    this._search$.next();
  }

  performReset() {
    this._transfers$.next([]);
    this._total$.next(0);
  }

  updateReportDownloadLink() {
    // tslint:disable-next-line:no-any
    const params: any = {
      token: this.authService.getBearerToken(),
      _project: [...this.project, 'merchantTitle']
    };

    if (this.account.length > 0) params.accountId = this.account;
    if (this.searchTerm.length > 0) params.s = this.searchTerm;
    if (this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toISOString();
    }
    if (this._state.dateTo.year > 2010) {
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }
    if (this._state.status) {
      params.status = this._state.status;
    }
    // if (this.connectedBanking) {
    //   params.connectedBanking = this.connectedBanking;
    // }
    let paramsSerialized = '';

    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }

    const newLink =
      environment.apiPrefix + '/transfer/report/download?' + paramsSerialized;

    if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Link
    this.reportDownloadLink$.next(newLink);
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

  get status() {
    return this._state.status;
  }

  set status(status) {
    console.log(status);
    this._set({ status });
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
    // this.dateFromMax = this.calendar.getNext(
    //   new NgbDate(this.dateTo.year, this.dateTo.month, this.dateTo.day),
    //   'd',
    //   0
    // );
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
      ).toISOString();
    }

    if (this._state.dateTo.year > 2010) {
      // add one day
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }

    if (this._state.account.length > 0) {
      params.account = this._state.account;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    if (this._state.status) {
      params.status = this._state.status;
    }

    let url = environment.apiPrefix + '/transfer';

    if (this.connectedBanking) {
      url += '/bank-account-transfers';
    }

    return this.httpClient
      .get<TransfersResponseModel>(url, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          if (resp.success) {
            try {
              // Update the entries
              resp.result.filter((transfer: Transfer) => {
                transfer.createdAtParsed = new Date(transfer.createdAt);
                // transfer.createdAtParsed = new Date(
                //   Date.parse(transfer.createdAt)
                // );
                return transfer;
              });

              console.log('After filteration transfers');
              console.log(resp.result);
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

import { Injectable } from '@angular/core';
import { SortDirection } from '@modules/tables/directives';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import {
  BankStatement,
  BankstatementRespModel
} from '@modules/bank-account/models';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { AuthService } from '@modules/auth/services';
import { environment } from 'environments/environment';
import { catchError, map } from 'rxjs/operators';

interface State {
  page: number;
  pageSize: number;
  s: string;
  sortColumn: string;

  dateFrom: NgbDateStruct;
  dateFromMin: NgbDateStruct;
  dateFromMax: NgbDateStruct;

  dateTo: NgbDateStruct;
  dateToMin: NgbDateStruct;
  dateToMax: NgbDateStruct;

  sortDirection: SortDirection;
  accountId: string | null;
  token: string;

  bank: string;
}

interface Params {
  page: number;
  s: string;
  dateFrom: string;
  dateTo: string;
  bankAccountNo: string;
  token: string;
  merchantId: string;
  bank: string;
}

@Injectable({
  providedIn: 'root'
})
export class BankStatementsService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _statements$ = new BehaviorSubject<BankStatement[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private reportDownloadLink$ = new BehaviorSubject('#');
  private fieldUpdates = new Subject<void>();

  private _state: State = {
    token: '',
    accountId: '',
    s: '',
    pageSize: 10,
    sortColumn: '',
    page: 1,
    sortDirection: '',

    dateFrom: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    dateFromMin: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    dateFromMax: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),

    dateTo: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    dateToMin: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    dateToMax: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    bank: ''
  };

  constructor(
    private calendar: NgbCalendar,
    private httpClient: HttpClient,
    private authService: AuthService,
    private dateParser: NgbDateParserService,
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

    this.fieldUpdates.subscribe(() => {
      // Update the download report link
      this.updateReportDownloadLink();
    });
  }

  get statement$() {
    return this._statements$.asObservable();
  }

  get total$() {
    return this._total$.asObservable();
  }

  get loading$() {
    return this._loading$.asObservable();
  }

  get accountId() {
    return this._state.accountId;
  }

  set accountId(accountId: string | null) {
    this._set({ accountId });
  }

  get page() {
    return this._state.page;
  }

  set page(page: number) {
    this._set({ page });
    this.retrieveBankStatements().subscribe();
  }

  get s() {
    return this._state.s;
  }

  set s(s: string) {
    this._set({ s });
  }

  get dateFrom() {
    return this._state.dateFrom;
  }

  set dateFrom(dateFrom) {
    this._set({ dateFrom });

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

  retrieveBankStatements(isAdmin?: boolean, accountId?: string | null) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this._loading$.next(true);

    let params = new HttpParams();
    if (accountId || this.accountId) {
      let accNum = accountId ? accountId : this.accountId;
      if (accNum) {
        params = params.set('bankAccountNo', accNum.toString());
      }
    }
    params = params.set('page', this.page.toString());

    if (this._state.dateFrom && this._state.dateFrom.year > 2010) {
      params = params.set(
        'dateFrom',
        new Date(this.dateParser.format(this._state.dateFrom)).toISOString()
      );
    }

    if (this._state.dateTo && this._state.dateTo.year > 2010) {
      //add a day to dateTo
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);

      params = params.set(
        'dateTo',
        new Date(this.dateParser.format(newDate)).toISOString()
      );
    }

    let url = environment.apiPrefix + '/super-admin/bank-account/statement';
    if (!isAdmin) {
      url = environment.apiPrefix + '/bank-account/statement';
    }

    return this.httpClient
      .get<BankstatementRespModel>(url, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          console.log(resp);
          this._statements$.next(resp.result);
          this._total$.next(resp.allItemsCount);
          this._loading$.next(false);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          this._loading$.next(false);
          return throwError(err);
        })
      );
  }

  updateReportDownloadLink() {
    const params = {
      token: this.authService.getBearerToken() || '',
      page: this.page
    } as Params;

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
    if (this.accountId) {
      params.bankAccountNo = this.accountId;
    }

    let paramsSerialized = '';

    for (let [key, value] of Object.entries(params)) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${key}=${value}`;
    }
    let newLink;
    this.authService.isSuperAdmin()
      ? (newLink =
          environment.apiPrefix +
          '/super-admin/bank-account/statement/report/download?' +
          paramsSerialized)
      : (newLink =
          environment.apiPrefix +
          '/bank-account/statement/report/download?' +
          paramsSerialized);
    if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
      return;
    }
      // Set the generated New Link
      this.reportDownloadLink$.next(newLink);
  }
}

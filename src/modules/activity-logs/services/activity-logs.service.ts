import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { AuthService } from '@modules/auth/services';
import { SortDirection } from '@modules/tables/directives';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { BehaviorSubject, Subject } from 'rxjs';

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
  accountId: string;
  token: string;
}

@Injectable()
export class ActivityLogsService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _statements$ = new BehaviorSubject<any[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private reportDownloadLink$ = new BehaviorSubject('#');
  private fieldUpdates = new Subject<void>();
  isAdmin = false;
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
    dateToMax: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0)
  };

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private calendar: NgbCalendar
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

    this.fieldUpdates.subscribe(() => {});
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

  set accountId(accountId: string) {
    this._set({ accountId });
  }

  get page() {
    return this._state.page;
  }

  set page(page: number) {
    this._set({ page });
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

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this.fieldUpdates.next();
    this._search$.next();
  }

  //fetch all activity logs
  getLogs(merchantId: string = '', accountId: string = '', params: any) {
    // @ts-ignore
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.authService.getBearerToken()
    });

    let apiPrefix = environment.apiPrefix;

    apiPrefix += '/' + environment.urlAdminPrefix;
    if (merchantId) {
      params.merchantId = merchantId;
    }
    if (accountId) {
      params.accountId = accountId;
    }

    let url = apiPrefix + '/activity-logs/';
    return this.httpClient.get(url, {
      headers: httpHeaders,
      params
    });
  }
}

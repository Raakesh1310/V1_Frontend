import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { MerchantResponseModel } from '@modules/auth/models/merchant.model';
import { AuthService } from '@modules/auth/services';
import { SortDirection } from '@modules/tables/directives';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Mail, MailInput, MailResponse } from '../models';

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
}

@Injectable()
export class MailService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _mails$ = new BehaviorSubject<Mail[]>([]);
  public _selectedmail = {} as Mail;
  public _mails = [] as Mail[];
  private _total$ = new BehaviorSubject<number>(0);
  private mails: Mail[] = [];

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

    status: ''
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
  }

  retrieveData() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // tslint:disable-next-line:no-any
    let params = new HttpParams();
    params = params.append('page', this.page.toString());

    if (this._state.dateFrom && this._state.dateFrom.year > 2010) {
      params = params.append(
        'dateFrom',
        new Date(this.dateParser.format(this._state.dateFrom)).toISOString()
      );
    }

    if (this._state.dateTo && this._state.dateTo.year > 2010) {
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);

      params = params.append(
        'dateTo',
        new Date(this.dateParser.format(newDate)).toISOString()
      );
    }

    if (this._state.status !== '') {
      params = params.append('status', this.status);
    }

    if (this._state.searchTerm.length > 0) {
      params = params.append('s', this._state.searchTerm);
    }

    return this.httpClient
      .get<MailResponse>(environment.apiPrefix + '/super-admin/mail', {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          console.log(resp);
          if (resp.success) {
            try {
              this.mails = resp.result;
              if (
                typeof this.mails === 'undefined' ||
                this.mails.length === 0
              ) {
                this.mails = [];
              }
              this._mails$.next(this.mails);
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

  // ############################ GET MAIL FUNCTIONS ##############################

  get mails$() {
    return this._mails$.asObservable();
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

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this.fieldUpdates.next();
    this._search$.next();
  }

  // ##############################################################################

  sendMail(data: MailInput) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post<MailResponse>(
      environment.apiPrefix + '/super-admin/mail/',
      data,
      {
        headers: httpHeaders
      }
    );
  }

  getMerchants() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let params = { page: '-1' };
    return this.httpClient.get<MerchantResponseModel>(
      environment.apiPrefix + '/super-admin/merchant/',
      {
        headers: httpHeaders,
        params: params
      }
    );
  }
}

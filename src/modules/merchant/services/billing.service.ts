import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { MerchantResponseModel } from '@modules/auth/models/merchant.model';
import { AuthService } from '@modules/auth/services';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Bill, BillResponseModel } from '../models/merchant.model';

interface State {
  page: number;

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

  feeType: string;
  token: string;
  merchantId: string;
  merchants: string[];
}

@Injectable()
export class BillingService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  public _bills = [] as Bill[];
  private _total$ = new BehaviorSubject<number>(0);
  private bills: Bill[] = [];

  private _bills$ = new BehaviorSubject<Bill[]>([]);
  private reportDownloadLink$ = new BehaviorSubject('#');
  private fieldUpdates = new Subject<void>();

  private _state: State = {
    merchants: [],
    merchantId: '',
    token: this.authService.getBearerToken() || '',
    feeType: '',
    page: 1,

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
    dateToMax: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0)
  };

  constructor(
    private httpClient: HttpClient,
    private dateParser: NgbDateParserService,
    private calendar: NgbCalendar,
    private authService: AuthService
  ) {
    this.fieldUpdates.subscribe(() => {
      // Update the download report link
      this.updateReportDownloadLink();
    });
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
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        switchMap(() => this._search()),
        tap(() => this._loading$.next(false))
      )
      .subscribe((resp: BillResponseModel) => {
        try {
          console.log(resp);
          this._bills$.next(resp.result);
          this._total$.next(resp.allItemsCount);
        } catch (e) {
          this._bills$.next([]);
        }
      });
  }

  updateReportDownloadLink() {
    let params = {
      token: this._state.token,
      page: -1,
      dateFrom: '',
      dateTo: '',
      feeType: ''
    } as any;

    if (this._state.merchants.length > 0) {
      params.merchants = this.merchants;
    }

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

    if (this._state.feeType !== '') {
      params.feeType = this.feeType;
    }

    let paramsSerialized = '';

    for (let [key, value] of Object.entries(params)) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${key}=${value}`;
    }

    const newLink =
      environment.apiPrefix +
      '/super-admin/billing/report/download?' +
      paramsSerialized;

    if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Link
    this.reportDownloadLink$.next(newLink);
  }

  public fetchData = () => {
    this._search$.next();
  };

  get merchants() {
    return this._state.merchants;
  }

  set merchants(merchants: string[]) {
    this._set({ merchants });
  }

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  get bills$(): Observable<Bill[]> {
    return this._bills$.asObservable();
  }

  get page(): number {
    return this._state.page;
  }

  set page(value: number) {
    this._state.page = value;
    this._search$.next();
  }

  get total$() {
    return this._total$.asObservable();
  }

  get feeType() {
    return this._state.feeType;
  }

  set feeType(feeType: string) {
    this._set({ feeType });
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

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this.fieldUpdates.next();
    // this._search$.next();
  }

  getMerchants() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let params = new HttpParams();

    params = params.set('page', '-1');

    return this.httpClient.get<MerchantResponseModel>(
      environment.apiPrefix + '/super-admin/merchant/',
      {
        headers: httpHeaders,
        params: params
      }
    );
  }

  public _search = (): Observable<BillResponseModel> => {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('serviced ==>>>');

    // Enable the loading text
    this._loading$.next(true);

    let params = new HttpParams();
    params = params.set('page', this.page.toString());

    if (this._state.dateFrom && this._state.dateFrom.year > 2010) {
      params = params.set(
        'dateFrom',
        new Date(this.dateParser.format(this._state.dateFrom)).toISOString()
      );
    }

    if (this._state.dateTo && this._state.dateTo.year > 2010) {
      params = params.set(
        'dateTo',
        new Date(this.dateParser.format(this._state.dateTo)).toISOString()
      );
    }
    if (this._state.feeType !== '') {
      params = params.set('feeType', this._state.feeType);
    }

    if (this.merchants.length > 0) {
      console.log(this.merchants);
      this.merchants.forEach(
        merchant => (params = params.append('merchants', merchant))
      );
    }

    return this.httpClient
      .get<BillResponseModel>(environment.apiPrefix + '/super-admin/billing', {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          console.log(resp);
          if (resp.success) {
            // console.log(resp);
            try {
              this.bills = resp.result;

              this._bills$.next(this.bills);
              this._total$.next(resp.allItemsCount);
            } catch (e) {
              console.error(e);
              // req.errors = [e.message];
            }
          }

          // Disable the Loading text before returning anything
          this._loading$.next(false);
          return resp;
        })
      );
  };
}

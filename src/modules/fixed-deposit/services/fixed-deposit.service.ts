import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { TransfersResponseModel } from '@modules/passbook/models/transfers-response.model';
import { Transfer } from '@modules/transfers/models';
import {
  NgbDate,
  NgbCalendar,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  FixedDepositDetail,
  FixedDepositInput,
  FixedDepositResp
} from '../models';

interface State {
  page: number;
  s: string;
  dateFrom: NgbDateStruct;
  dateTo: NgbDateStruct;
  status: string;
}

@Injectable()
export class FixedDepositService {
  constructor(
    private httpClient: HttpClient,
    private dateParser: NgbDateParserService,
    private calendar: NgbCalendar
  ) {}

  accountId = '';

  private _state: State = {
    s: '',
    page: 1,
    dateFrom: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    dateTo: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0),
    status: ''
  };

  private _loading$ = new BehaviorSubject<boolean>(true);
  public _fds$ = new BehaviorSubject<FixedDepositDetail[]>([]);
  public _total$ = new BehaviorSubject<number>(0);

  retrieveData(downloadPage?: Number) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // tslint:disable-next-line:no-any
    let params = new HttpParams();
    params = params.append('page', downloadPage ? downloadPage.toString() :this.page.toString());

    if (this.accountId) {
      params = params.append('accountId', this.accountId);
    }

    if (this._state.dateFrom && this._state.dateFrom.year > 2010) {
      params = params.append(
        'dateFrom',
        new Date(this.dateParser.format(this._state.dateFrom)).toISOString()
      );
    }

    if (this._state.dateTo && this._state.dateTo.year > 2010) {
      params = params.append(
        'dateTo',
        new Date(this.dateParser.format(this._state.dateTo)).toISOString()
      );
    }

    if (this._state.status !== '') {
      params = params.append('status', this.status);
    }

    if (this.searchTerm.length > 0) {
      params = params.append('s', this.searchTerm);
    }

    return this.httpClient
      .get<FixedDepositResp>(
        environment.apiPrefix + '/super-admin/fixed-deposit',
        {
          headers: httpHeaders,
          params
        }
      )
      .pipe(
        map(resp => {
          console.log(resp);
          if (resp.success && !downloadPage) {
            try {
              this._fds$.next(resp.result);
              this._total$.next(resp.allItemsCount);
            } catch (e) {
              console.error(e);
              // req.errors = [e.message];
            }
          } else if (resp.success && downloadPage) {
            return resp;
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

  get searchTerm() {
    return this._state.s;
  }

  set searchTerm(searchTerm: string) {
    this._set({ s: searchTerm });
  }

  get dateFrom() {
    return this._state.dateFrom;
  }

  set dateFrom(dateFrom) {
    this._set({ dateFrom });
  }

  get dateTo() {
    return this._state.dateTo;
  }

  set dateTo(dateTo) {
    this._set({ dateTo });
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
    // this._search$.next();
  }

  getFixedDeposit$(): Observable<{}> {
    return of({});
  }

  updateInterest(interestINR: number, fdId: string | undefined, partialClosureAmount: number | null) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.patch<FixedDepositResp>(
      `${environment.apiPrefix}/super-admin/fixed-deposit/${fdId}`,
      { interestINR, partialClosureAmount },
      { headers: httpHeaders }
    );
  }

  createFD(data: FixedDepositInput, fixedDepositId: string | undefined) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (fixedDepositId) {
      return this.httpClient.put<FixedDepositResp>(
        `${environment.apiPrefix}/super-admin/fixed-deposit/${fixedDepositId}`,
        data,
        { headers: httpHeaders }
      );
    }

    return this.httpClient.post<FixedDepositResp>(
      `${environment.apiPrefix}/super-admin/fixed-deposit`,
      data,
      { headers: httpHeaders }
    );
  }
}

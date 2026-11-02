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
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map } from 'rxjs/operators';

import { Deal, DealDocument, DealResponseModel } from '../models';

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
export class DealService {
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private dateParser: NgbDateParserService,
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

    this.fieldUpdates.subscribe(() => {
      // Update the download report link
      this.updateReportDownloadLink();
    });
  }

  get transfers$() {
    return this._deals$.asObservable();
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

  isSuperAdmin = false;

  /**
   * #############################################
   *                LISTING FUNCTIONS
   * #############################################
   */

  // PARAM VARIABLES
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  public _deals$ = new BehaviorSubject<DealDocument[]>([]);
  public _deals = [] as Deal[];
  private _total$ = new BehaviorSubject<number>(0);
  private deals: DealDocument[] = [];

  private reportDownloadLink$ = new BehaviorSubject('#');
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

  getDeal$(): Observable<{}> {
    return of({});
  }

  getDealDetails(dealId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });
    let apiPath = this.isSuperAdmin ? '/super-admin/deal/' : '/deal/';
    return this.httpClient.get(`${environment.apiPrefix}${apiPath}${dealId}`);
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
      params.dateTo = new Date(
        this.dateParser.format(this._state.dateTo)
      ).toISOString();
    }
    if (this._state.status !== '') {
      params.status = this.status;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    let paramsSerialized = '';

    if (params.length > 0) {
      for (const paramsKey of params) {
        if (paramsSerialized.length > 0) {
          paramsSerialized += '&';
        }
        paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
      }
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

  retrieveData() {
    let url = environment.apiPrefix + '/deal/';
    if (this.isSuperAdmin) {
      url = environment.apiPrefix + '/super-admin/deal/';
    }

    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

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
    if (this._state.status !== '') {
      params.status = this.status;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    console.log(params);

    return this.httpClient
      .get<DealResponseModel>(url, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          console.log(resp);
          if (resp.success) {
            // console.log(resp);
            try {
              this.deals = resp.result;
              this._deals$.next(this.deals);
              this._total$.next(resp.allItemsCount);
            } catch (e) {
              console.error(e);
            }
          }

          // Disable the Loading text before returning anything
          this._loading$.next(false);
          return resp;
        }),
        catchError((err: any) => {
          console.error(err);

          // Disable the Loading text before returning anything
          this._loading$.next(false);

          return throwError(err);
        })
      );
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this.fieldUpdates.next();
    this._search$.next();
  }

  /**
   * ##############################################
   *                SERVICE FUNCTIONS
   * ##############################################
   */

  approveDeal(dealId: string, otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // creating request
    return this.httpClient.patch<any>(
      environment.apiPrefix + `/deal/${dealId}`,
      { approved: true, otp },
      {
        headers: httpHeaders
      }
    );
  }

  rejectDeal(dealId: string, otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.patch<any>(
      environment.apiPrefix + `/deal/${dealId}`,
      { approved: false, otp },
      {
        headers: httpHeaders
      }
    );
  }

  createDeal(data: Deal) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log(data);

    // creating request
    return this.httpClient.post<any>(environment.apiPrefix + '/deal', data, {
      headers: httpHeaders
    });
  }

  updateDeal(data: Deal, dealId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log(data);

    // creating request
    return this.httpClient.put<any>(
      environment.apiPrefix + '/deal/' + dealId,
      data,
      {
        headers: httpHeaders
      }
    );
  }

  upload(formData: FormData) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });

    // creating request
    return this.httpClient.post<any>(
      environment.apiPrefix + '/deal/document/',
      formData
    );
  }

  deleteDocument(documentId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });

    // creating request
    return this.httpClient.delete<any>(
      `${environment.apiPrefix}/deal/document/${documentId}`
    );
  }

  initRefund(deal: DealDocument, otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });
    return this.httpClient.post<any>(
      `${environment.apiPrefix}/deal/${deal.dealId}/refund`,
      { otp }
    );
  }

  approveRefund(deal: DealDocument, otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });
    return this.httpClient.patch<any>(
      `${environment.apiPrefix}/deal/${deal.dealId}/refund`,
      { otp, approved: true }
    );
  }

  rejectRefund(deal: DealDocument, otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });
    return this.httpClient.patch<any>(
      `${environment.apiPrefix}/deal/${deal.dealId}/refund`,
      { otp, approved: false }
    );
  }

  initClaim(deal: DealDocument, claim: object, otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });
    const body = { otp, ...claim };
    console.log(body);
    return this.httpClient.post<any>(
      `${environment.apiPrefix}/deal/${deal.dealId}/claim`,
      body
    );
  }

  approveClaim(deal: DealDocument, otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });
    return this.httpClient.patch<any>(
      `${environment.apiPrefix}/deal/${deal.dealId}/claim`,
      { otp, approved: true }
    );
  }

  rejectClaim(deal: DealDocument, otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });
    return this.httpClient.patch<any>(
      `${environment.apiPrefix}/deal/${deal.dealId}/claim`,
      { otp, approved: false }
    );
  }
}

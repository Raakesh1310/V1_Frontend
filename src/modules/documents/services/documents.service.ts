import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { SortDirection } from '@modules/transactions/directives';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import { Order, OrderRespModel } from '../models/doqfy.model';
import { AuthService } from '@modules/auth/services';
import { UtilityService } from '@common/services';

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
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
  status: string;
}

function compare(v1: number | string, v2: number | string) {
  return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
}

@Injectable()
export class DocumentsService {
  private _order$ = new BehaviorSubject<Order[]>([]);
  private reportDownloadLink$ = new BehaviorSubject('#');
  private orders: Order[] = [];
  private fieldUpdates = new Subject<void>();
  private _state: State = {
    page: 1,
    pageSize: 8,
    searchTerm: '',
    sortColumn: '',
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
    private dateParser: NgbDateParserService,
    private calendar: NgbCalendar,
    private authService: AuthService,
    private utilityService: UtilityService
  ) {
    this.fieldUpdates.subscribe(() => {
      // Update the download report link
      console.log('DOWNLOADING...');
      this.downloadExcel();
    });
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(120),
        switchMap(() => this._search()),
        delay(120),
        tap(() => this._loading$.next(false))
      )
      .subscribe(result => {
        try {
          this._order$.next(result.result);
          this._total$.next(result.allItemsCount);
        } catch (e) {
          console.error(e);
        }
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
  }

  private _loading$ = new BehaviorSubject<boolean>(true);

  get loading$() {
    return this._loading$.asObservable();
  }

  private _search$ = new Subject<void>();

  get search$() {
    return this._search$;
  }

  private _total$ = new BehaviorSubject<number>(0);

  get total$() {
    return this._total$.asObservable();
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

  get orders$() {
    return this._order$.asObservable();
  }

  get page() {
    return this._state.page;
  }

  set page(page: number) {
    this._set({ page });
    this._search$.next();
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

  performSearch() {
    this._search$.next();
  }

  findById(orderId: string): Order | null {
    let result = null;

    this._order$.getValue().forEach(order => {
      if (order.documentId === orderId) {
        result = order;
      }
    });

    return result;
  }

  getDownloadableLink(docid: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.get(
      `${environment.apiPrefix}/doqfy/order/${docid}/file`
    );
  }

  sendToSign(data: any, link: string, docId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (link) {
      return this.httpClient.post(
        `${environment.apiPrefix}/${link}/${docId}`,
        data
      );
    }
    return this.httpClient.post(
      `${environment.apiPrefix}/document/${docId}/esign/DOQFY`,
      data
    );
  }

  refreshOrder(orderid: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    console.log(orderid);
    return this.httpClient.get<OrderRespModel>(
      `${environment.apiPrefix}/doqfy/order/${orderid}`
    );
  }

  fetchOrders() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.get(`${environment.apiPrefix}/document/`);
  }

  uploadFile(formdata: FormData, uploadLink: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post(environment.apiPrefix + uploadLink, formdata);
  }

  fetchBranchList() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.get(`${environment.apiPrefix}/doqfy/branch`);
  }

  downloadExcel() {
    console.log('Retrieving Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // if(localStorage.getItem('pageMe')){
    //   this.page = -1;
    //   localStorage.removeItem('pageMe');
    // }

    // const params: any = { page: -1 };
    const params: any = {
      token: this.authService.getBearerToken()
    };

    if (this._state.dateFrom && this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toISOString();
    }

    if (this._state.dateTo && this._state.dateTo.year > 2010) {
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }

    if (this._state.status !== '') {
      params.status = this.status;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    // Enable the loading text
    // this._loading$.next(true);

    let paramsSerialized = '';
    console.log('Retrieving Data 1');
    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }

    const newLink =
      environment.apiPrefix + '/document/report/download?' + paramsSerialized;

    if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Link
    this.reportDownloadLink$.next(newLink);
    // this.httpClient
    //   .get(environment.apiPrefix + '/document/report/download', {
    //     headers: httpHeaders,
    //     params
    //   })
    //   .pipe(
    //     map((resp: any) => {
    //       if (resp.success) {
    //         console.log('DOWNLOAD EXCEL ', resp);
    //         try {
    //           this.orders = resp.result;
    //           if (
    //             typeof this.orders === 'undefined' ||
    //             this.orders.length === 0
    //           ) {
    //             this.orders = [];
    //           }
    //         } catch (e) {
    //           console.error(e);
    //           // req.errors = [e.message];
    //         }
    //       }
    //
    //       // Disable the Loading text before returning anything
    //       // this._loading$.next(false);
    //       return resp;
    //     }),
    //     // tslint:disable-next-line:no-any
    //     catchError((err: any) => {
    //       console.error(err);
    //
    //       // Disable the Loading text before returning anything
    //       // this._loading$.next(false);
    //
    //       return throwError(err);
    //     })
    //   );
  }

  // private _set(patch: Partial<State>) {
  //   Object.assign(this._state, patch);
  //   this.fieldUpdates.next();
  //   // this._search$.next();
  // }

  private _search() {
    console.log('Retrieving Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let url = environment.apiPrefix + '/document';

    const params: any = {};

    if (this._state.dateFrom && this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toISOString();
    }

    if (this._state.dateTo && this._state.dateTo.year > 2010) {
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }

    if (this._state.status !== '') {
      params.status = this.status;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    params.page = this.page;

    // Enable the loading text
    this._loading$.next(true);

    return this.httpClient
      .get(url, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map((resp: any) => {
          if (resp.success) {
            console.log(resp);
            try {
              this.orders = resp.result;
              if (
                typeof this.orders === 'undefined' ||
                this.orders.length === 0
              ) {
                this.orders = [];
              }
            } catch (e) {
              console.error(e);
              // req.errors = [e.message];
            }
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

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this.fieldUpdates.next();
  }
}

// let paramsSerialized = '';
//
//     if (localStorage.getItem('pageMe')) {
//       // this.page = -1;
//       localStorage.removeItem('pageMe');
//       params.token = this.authService.getBearerToken();
//
//       for (const paramsKey in params) {
//         if (paramsSerialized.length > 0) {
//           paramsSerialized += '&';
//         }
//         paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
//       }
//       url = environment.apiPrefix + '/document/report/download?' +
//         paramsSerialized;
//     } else {
//       params.page = this.page;
//     }

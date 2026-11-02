import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { SortDirection } from '@modules/tables/directives';
import { TransactionsResponseModel } from '@modules/transactions/models/transactions-response.model';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import {
  AccountDetails,
  EscrowPage,
  EscrowPageChildPage,
  EscrowPageRespModel
} from '../models';

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
}

@Injectable()
export class EscrowPagesService {
  public isSuperAdmin = false;
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _total$ = new BehaviorSubject<number>(0);
  private fieldUpdates = new Subject<void>();
  private _searchUrl = '';
  private _escrowPages$ = new BehaviorSubject<EscrowPage[]>([]);

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
    sortDirection: ''
  };

  constructor(
    private httpClient: HttpClient,
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

    // Handle the field update

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

        this._escrowPages$.next(txResponse.result || []);
        this._total$.next(txResponse.allItemsCount);
      });

    // this._search$.next();
  }

  // Trigger the Search for entries

  performSearch() {
    this.page = 1;
    if (this.isSuperAdmin) {
      this._searchUrl =
        environment.apiPrefix +
        '/' +
        environment.urlAdminPrefix +
        '/escrow-pages';
    } else {
      this._searchUrl = environment.apiPrefix + '/escrow-page';
    }

    this._search$.next();
  }

  performRefresh() {
    if (this.isSuperAdmin) {
      this._searchUrl =
        environment.apiPrefix +
        '/' +
        environment.urlAdminPrefix +
        '/escrow-pages';
    } else {
      this._searchUrl = environment.apiPrefix + '/escrow-page';
    }
    this._search$.next();
  }

  performReset() {
    this._escrowPages$.next([]);
    this._total$.next(0);
  }

  get escrowPages$() {
    return this._escrowPages$.asObservable();
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

  /**
   * date getter setter
   */

  get dateFrom() {
    return this._state.dateFrom;
  }

  get dateTo() {
    return this._state.dateTo;
  }

  set dateFrom(dateFrom) {
    this._set({ dateFrom });
    this.dateToMin = this.calendar.getNext(
      new NgbDate(this.dateFrom.year, this.dateFrom.month, this.dateFrom.day),
      'd',
      0
    );
  }

  set dateTo(dateTo) {
    this._set({ dateTo });

    this.dateFromMax = this.calendar.getNext(
      new NgbDate(this.dateTo.year, this.dateTo.month, this.dateTo.day),
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

  /**
   * sort getter setter
   */

  set sortColumn(sortColumn: string) {
    this._set({ sortColumn });
  }

  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  /**
   * backend functions
   */

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this.fieldUpdates.next();
  }

  private _search(): Observable<TransactionsResponseModel> {
    console.log('Retrieving escrow pages Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // Prepare Params
    // tslint:disable-next-line:no-any
    const params: any = { page: this.page };

    if (this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toISOString();
    }

    if (this._state.dateTo.year > 2010) {
      //add a day to dateTo
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    return this.httpClient
      .get<EscrowPageRespModel>(this._searchUrl, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          if (resp.success) {
            try {
              // Update the entries
              resp.result.filter((escrowPages: EscrowPage) => {
                return escrowPages;
              });
            } catch (e) {
              console.error(e);
            }
          }
          return resp;
        }),
        catchError(err => {
          console.error(err);
          return throwError(err);
        })
      );
  }

  /**
   * normal function
   */

  getEscrowPages$(): Observable<{}> {
    return of({});
  }

  /**
   * Get escrow page by escorwpage id
   * @param escrowPageId
   */
  getEscrowPage(escrowPageId: string | null) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.get(
      `${environment.apiPrefix}/escrow-page/details/${escrowPageId}`
    );
  }

  /**
   * Get all escrow pages
   */
  getEscrowPages() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.get(`${environment.apiPrefix}/escrow-page`);
  }

  /**
   * get customer details
   * @param pageId
   */
  getCustomerDetail(pageId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    console.log('\n\n\n\n', pageId);
    return this.httpClient.get(
      `${environment.apiPrefix}/escrow-page/${pageId}/entry`
    );
  }

  /**
   * Create escrow page
   * @param body
   */
  create(body: AccountDetails) {
    console.log(body);
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post(
      environment.apiPrefix + '/escrow-page/create',
      body
    );
  }

  /**
   * Update escrow page
   * @param escrowPageId
   * @param data
   */
  updateEscrowPage(escrowPageId: string, data: object) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('updating data: ', data);
    return this.httpClient.patch(
      `${environment.apiPrefix}/escrow-page/${escrowPageId}`,
      data
    );
  }

  /**
   * Update child pages
   * @param escrowPageId
   * @param pageId
   * @param page
   */
  updateEscrowChildPage(
    escrowPageId: string,
    pageId: string,
    page: EscrowPageChildPage
  ) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('updating data: ', page);
    return this.httpClient.patch(
      `${environment.apiPrefix}/escrow-page/${escrowPageId}/page/${pageId}`,
      page
    );
  }
  /**
   * Save customer data
   */
  submitCustomerData(escrowPageId: string, page: EscrowPage) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('updating data: ', page);
    return this.httpClient.post(
      `${environment.apiPrefix}/escrow-page/${escrowPageId}/entry`,
      page
    );
  }

  /**
   * API call to create payment order
   *
   * @param data
   */
  createBypassedOrder(escrowPageId: string) {
    // const httpHeaders = new HttpHeaders({
    //   'Content-Type': 'application/json'
    // });
    return this.httpClient.post(
      `${environment.apiPrefix}/escrow-page/${escrowPageId}/create-order-bypassed`,
      {}
    );
  }

  /**
   * API call to create payment order
   *
   * @param data
   */
  createOrder(escrowPageId: string, data: any) {
    // const httpHeaders = new HttpHeaders({
    //   'Content-Type': 'application/json'
    // });
    return this.httpClient.post(
      `${environment.apiPrefix}/escrow-page/${escrowPageId}/create-order`,
      data
    );
  }

  /**
   * Get order status
   * @param data
   */
  getOrderStatus(data: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.get(
      `${environment.apiPrefix}/escrow-page/${data.escrowPageId}/${data.orderId}`
    );
  }
}

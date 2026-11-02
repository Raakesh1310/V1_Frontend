import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BooleanResponseModel } from '@common/models/boolean-response.model';
import { UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { Account } from '@modules/accounts/models';
import { Merchant } from '@modules/auth/models/merchant.model';
import { AuthService } from '@modules/auth/services';
import { MerchantListResponseModel } from '@modules/merchant/models/merchant-list-response.model';
import { SortDirection } from '@modules/tables/directives';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { CreateMerchantResponseInterface } from '../models/merchant-create.model';

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
  linkedBank: string;
  isIDFCWhiteLabel?: boolean;
  isCarLoan: boolean | string;
}

@Injectable()
export class MerchantService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  public _selectedAccount = {} as Account;
  public _selectedAccountBalance = -1;
  public _accounts = [] as Account[];
  private _total$ = new BehaviorSubject<number>(0);
  private merchants: Merchant[] = [];

  private _merchants$ = new BehaviorSubject<Merchant[]>([]);
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

    status: '',
    linkedBank: '',
    isIDFCWhiteLabel: false,
    isCarLoan: ''
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
      .subscribe({
        next: (result: MerchantListResponseModel) => {
          try {
            console.log(result);
            this._merchants$.next(result.result);
            this._total$.next(result.allItemsCount);
          } catch (e) {
            this._merchants$.next([]);
          }
        },
        error: () => {
          this._loading$.next(false);
          this._merchants$.next([]);
        }
      });
  }

  updateReportDownloadLink() {
    // tslint:disable-next-line:no-any
    const params: any = {
      token: this.authService.getBearerToken()
    };

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
    if (this._state.status !== '') {
      params.status = this.status;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    if (this._state.linkedBank !== '') {
      params.linkedBank = this.linkedBank;
    }

    if (this._state.isIDFCWhiteLabel !== undefined) {
      params.isIDFCWhiteLabel = this._state.isIDFCWhiteLabel;
    }

    if (this._state.isCarLoan !== undefined && this._state.isCarLoan !== '' ) {
      params.isCarLoan = this._state.isCarLoan;
    }

    let paramsSerialized = '';

    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }

    const newLink =
      environment.apiPrefix +
      '/super-admin/merchant/report/download?' +
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

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  get merchants$(): Observable<Merchant[]> {
    return this._merchants$.asObservable();
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

  get pageSize() {
    return this._state.pageSize;
  }

  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }

  set idfcWhiteLabel(isIDFCWhiteLabel: boolean) {
    this._set({ isIDFCWhiteLabel });
  }

  get idfcWhiteLabel() {
    return this._state.isIDFCWhiteLabel ?? false;
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

  get linkedBank() {
    return this._state.linkedBank;
  }

  set linkedBank(linkedBank) {
    console.log(linkedBank);
    this._set({ linkedBank });
  }

  get isCarLoan() {
    return this._state.isCarLoan;
  }

  set isCarLoan(isCarLoan: boolean | string) {
    this._set({ isCarLoan });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this.fieldUpdates.next();
    // this._search$.next();
  }

  public activate(merchantId: string, otp: string) {
    console.log('Activating Merchant');
    return this._performAction(merchantId, 'activate', otp);
  }

  public deactivate(merchantId: string, otp: string) {
    console.log('Deactivating merchant');
    return this._performAction(merchantId, 'deactivate', otp);
  }

  private _performAction(merchantId: string, action: string, otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<BooleanResponseModel>(
      environment.apiPrefix +
      '/super-admin/merchant/' +
      merchantId +
      '/' +
      action,
      { otp },
      { headers: httpHeaders }
    );
  }

  private _search = (): Observable<MerchantListResponseModel> => {
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
      //add a day to dateTo
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);

      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }
    if (this._state.status !== '') {
      params.status = this.status;
    }

    if (this._state.linkedBank !== '') {
      params.linkedBank = this.linkedBank;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    if (this._state.isIDFCWhiteLabel !== undefined) {
      params.isIDFCWhiteLabel = this._state.isIDFCWhiteLabel;
    }

    if (this._state.isCarLoan !== undefined && this._state.isCarLoan !== '' ) {
      params.isCarLoan = this._state.isCarLoan;
    } else {
      delete params.isCarLoan;
    }

    console.log(params);

    return this.httpClient.get<MerchantListResponseModel>(
      environment.apiPrefix + '/super-admin/merchant',
      {
        headers: httpHeaders,
        params
      }
    );
  };

  fetchBasicDetails(merchantId: string, projection: string[]) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = { _project: projection };

    return this.httpClient.get<BooleanResponseModel>(
      environment.apiPrefix + '/super-admin/merchant/' + merchantId,
      { headers: httpHeaders, params }
    );
  }

  updateBasicDetail(merchantId: string, formData: object) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const url = `${environment.apiPrefix}/super-admin/merchant/${merchantId}`;
    return this.httpClient.patch<BooleanResponseModel>(url, formData);
  }

  public getMerchants = (): Observable<MerchantListResponseModel> => {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const params: any = { page: -1 };

    console.log(params);

    return this.httpClient.get<MerchantListResponseModel>(
      environment.apiPrefix + '/super-admin/merchant',
      {
        headers: httpHeaders,
        params
      }
    );
  };

  public createMerchant = (
    merchantDetail: object
  ): Observable<CreateMerchantResponseInterface> => {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<CreateMerchantResponseInterface>(
      environment.apiPrefix + '/super-admin/merchant',
      merchantDetail
    );
  };

  public updateProfileDetails = (
    merchantId: string,
    accountId: string,
    updates: object
  ): Observable<CreateMerchantResponseInterface> => {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let url =
      environment.apiPrefix + `/super-admin/merchant/${merchantId}/profile`;
    if (accountId.length > 0) {
      url = environment.apiPrefix + `/super-admin/account/${accountId}`;
    }

    return this.httpClient.patch<CreateMerchantResponseInterface>(url, updates);
  };

  public activateMerchant = (
    merchantId: string,
    merchantEmail: object
  ): Observable<BooleanResponseModel> => {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<BooleanResponseModel>(
      environment.apiPrefix + `/super-admin/merchant/${merchantId}/activate`,
      merchantEmail
    );
  };
}

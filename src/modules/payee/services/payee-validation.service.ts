import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { AuthService } from '@modules/auth/services';
import { SortDirection } from '@modules/transactions/directives';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
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
import {
  PayeeValidationResponseModel,
  PayeeValidationsResponseModel
} from '../models/payee-validation-response.model';
import {
  PayeeValidationInterface
} from '../models/payee-validation.model';

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
export class PayeeValidationService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _searchUrl = '';
  private _payeeValidations$ = new BehaviorSubject<PayeeValidationInterface[]>(
    []
  );
  // private _computedPayeeValidations$ = new BehaviorSubject<{
  //   [batchId: string]: PayeeCalculatedValues;
  // }>({});

  private _total$ = new BehaviorSubject<number>(0);

  project = [
    'batchId',
    'status',
    'merchant',
    'merchantId',
    'merchantTitle',
    'payeeList',
    'createdAt',
    'totalValidations',
    'batchUpdatedToEnterprise',
    'successfulValidations',
    'failedValidations',
    'payeeAdditionCompleted',
    'processingErrorValidations'
  ];

  // Download report link with default link addr #
  private reportDownloadLink$ = new BehaviorSubject('#');
  private fieldUpdates = new Subject<void>();
  public isSuperAdmin = false;

  // private

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
    private pipe: DecimalPipe,
    private httpClient: HttpClient,
    private dateParser: NgbDateParserService,
    private calendar: NgbCalendar,
    private authService: AuthService,
    private utilityService: UtilityService
  ) {
    // Update Date field limitations
    this.isSuperAdmin = authService.isSuperAdmin();
    this._searchUrl = environment.apiPrefix + '/payees-validation/';
    // !this.isSuperAdmin
    //   ? environment.apiPrefix + '/payees-validation/'
    //   : environment.apiPrefix + '/super-admin/payees-validation';

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
      .subscribe((txResponse: PayeeValidationsResponseModel) => {
        console.log(
          'Refreshing Payee Validation Response list.. with the following data'
        );
        console.log(txResponse);

        this._payeeValidations$.next(txResponse.result || []);
        this._total$.next(txResponse.allItemsCount);

        console.log(this._total$.getValue());
      });

    this._search$.next();

    // this.payeeValidations$.subscribe((payeeValues) => {
    //   payeeValues.map((payeeVal) => {
    //     this._computedPayeeValidations$.next({
    //       ...this._computedPayeeValidations$.value,
    //       [payeeVal.batchId]: {
    //         totalVerifications: payeeVal.payeeList.length,
    //         successfulVerifications: ((): number => {
    //           const val = payeeVal.payeeList.filter((payee) =>
    //             _.isEqual(payee.status, PayeeValidationStatus.VALID)
    //           );
    //           return val.length;
    //         })(),
    //         failedVerifications: payeeVal.payeeList.filter(
    //           (payee) =>
    //             _.isEqual(PayeeValidationStatus.INVALID, payee.status) ||
    //             _.isEqual(PayeeValidationStatus.PROCESSING_ERROR, payee.status)
    //         ).length,
    //       },
    //     });
    //   });
    // });
  }

  // Trigger the Search for entries

  /**
   * Use this function to perform search.
   */
  performSearch() {
    this.page = 1;
    this._search$.next();
  }

  /**
   *
   * @param params data to filter data
   * @returns payee validation request data
   * This function will find one payee-validations and with the filters given.
   */
  findOne = (params: any) => {
    if (!params || !params.batchId) {
      return null;
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const batchId = params.batchId;

    delete params.transactionId;
    return this.httpClient.get<PayeeValidationResponseModel>(this._searchUrl, {
      headers,
      params
    });
  };

  /**
   * This function will perform refresh.
   */
  performRefresh() {
    this._searchUrl = environment.apiPrefix + '/super-admin/payees-validation';
    this._search$.next();
  }

  performReset() {
    this._payeeValidations$.next([]);
    this._total$.next(0);
  }

  /**
   *
   * @param batchId Batch id of payee validations requests
   * @returns link for the download URL.
   * This function will be used to download the report.
   */
  validationReportURL(batchId: string): string {
    // tslint:disable-next-line:no-any
    const params: any = { token: this.authService.getBearerToken() };

    let paramsSerialized = '';

    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }

    let newLink = '';
    // if (this.isSuperAdmin) {
    //   newLink =
    //     environment.apiPrefix +
    //     `/super-admin/payees-validation/report/${batchId}/download?` +
    //     paramsSerialized;
    // } else {
    newLink =
      environment.apiPrefix +
      `/payees-validation/report/${batchId}/download?` +
      paramsSerialized;
    // }

    return newLink;
  }

  /**
   * This function will update the download link.
   * @returns download link url.
   */
  updateReportDownloadLink() {
    // tslint:disable-next-line:no-any
    const params: any = { token: this.authService.getBearerToken() };

    if (this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toISOString();
    }

    if (this._state.dateTo.year > 2010) {
      // add a date to dateTo
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    let paramsSerialized = '';

    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }

    let newLink = '';
    // if (this.isSuperAdmin) {
    //   newLink =
    //     environment.apiPrefix +
    //     '/super-admin/transaction/report/download?' +
    //     paramsSerialized;
    // } else {
    newLink =
      environment.apiPrefix +
      `/payees-validation/report/download?` +
      paramsSerialized;
    // }

    if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Link
    this.reportDownloadLink$.next(newLink);
  }

  get payeeValidations$() {
    return this._payeeValidations$.asObservable();
  }

  // get computedPayeeValidations$() {
  //   return this._computedPayeeValidations$.asObservable();
  // }

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

  /**
   * This function will search for the payee validations of a merchant or a super admin.
   * @returns Payee validations[].
   */
  private _search(): Observable<PayeeValidationsResponseModel> {
    console.log('Retrieving Transaction Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Prepare Params
    // tslint:disable-next-line:no-any
    const params: any = { page: this.page, _project: this.project };

    if (this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toUTCString();
    }

    if (this._state.dateTo.year > 2010) {
      // add one day to dateTo
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toUTCString();
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    console.log(params);

    return this.httpClient
      .get<PayeeValidationsResponseModel>(this._searchUrl, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          if (resp.success) {
            try {
              // Update the entries
              resp.result.filter((payeeVal: PayeeValidationInterface) => {
                if (payeeVal?.createdAt) {
                  payeeVal.createdAt = moment(payeeVal?.createdAt).format(
                    'DD MMM YY HH::mm::ss'
                  );
                }
                return payeeVal;
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
}

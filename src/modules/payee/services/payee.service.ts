import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { SortDirection } from '@modules/tables/directives';
import { SESSION_STORAGE, StorageService } from 'ngx-webstorage-service';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import { environment } from '../../../environments/environment';
// import { Payee } from '../models';
import { AddPayeeResponseModel } from '../models/add-payee-response.model';
import { PayeeResponseModel } from '../models/payee-response.model';
import { Payee } from '../models/payee.model';

interface SearchResult {
  payee: Payee[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
  type: string;
}

function compare(v1: number | string, v2: number | string) {
  return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
}

// function sort(payees: Payee[], column: string, direction: string): Payee[] {
//   if (direction === '') {
//     return payees;
//   } else {
//     return [...payees].sort((a, b) => {
//       const res = compare(a[column], b[column]);
//       return direction === 'asc' ? res : -res;
//     });
//   }
// }

// function matches(account: Account, term: string, pipe: PipeTransform) {
//   return (
//     (typeof account.email !== 'undefined' &&
//       account.email.toLowerCase().includes(term.toLowerCase())) ||
//     (typeof account.name !== 'undefined' &&
//       account.name.toLowerCase().includes(term.toLowerCase())) ||
//     (typeof account.accountId !== 'undefined' &&
//       account.accountId.toLowerCase().includes(term.toLowerCase()))
//   );
// }

@Injectable()
export class PayeeService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _payee$ = new BehaviorSubject<Payee[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private payees: Payee[] = [];
  public isAdmin = false;
  public merchantId = '';
  // Download report link with default link addr #
  private reportDownloadLink$ = new BehaviorSubject('#');
  private fieldUpdates = new Subject<void>();
  currentMerchantId: string | null = '';

  private _state: State = {
    page: 1,
    pageSize: 8,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
    type: ''
  };
  isSuperAdmin = false;

  constructor(
    private httpClient: HttpClient,
    private authservice: AuthService,
    private authService: AuthService,
    @Inject(SESSION_STORAGE) private storageService: StorageService
  ) {
    console.log('HELLLO ');
    // this.currentMerchantId = this.authService.getMerchantId();
    // Handle the field update
    this.fieldUpdates.subscribe(() => {
      // Update the download report link
      this.updateReportDownloadLink();
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
          this._payee$.next(result.result);
          this._total$.next(result.allItemsCount);
        } catch (e) {
          console.error(e);
        }
      });
    this.isAdmin = this.authservice.isSuperAdmin();
  }

  performSearch(num: number = 1) {
    this.page = num;
    this._search$.next();
  }

  get search$() {
    return this._search$;
  }

  /**
   * This Function Iterate through the list of payees
   * and return a single payee entry which matches the
   * given payeeId string
   *
   * @param payeeId payeeId string from payee list
   */
  findById(payeeId: string): Payee | null {
    let result = null;

    this._payee$.getValue().forEach(payee => {
      if (payee.payeeId === payeeId) {
        result = payee;
      }
    });

    return result;
  }

  findOne(payeeId: string, merchantId: string = '') {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    //tslint:disable-next-line:no-any
    const params: any = {};

    this._loading$.next(true);

    let url = environment.apiPrefix + '/payee/' + payeeId + '?status=Pending for Approval&status=Active&status=Inactive';
    if (this.isAdmin) {
      url = environment.apiPrefix + '/' + environment.urlAdminPrefix + '/payee/' + payeeId;
      params.merchantId = merchantId;
    }

    return this.httpClient.get(url, {
      headers: httpHeaders,
      params
    });
  }

  findByEmail(email: string, merchantId: string = '') {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    //tslint:disable-next-line:no-any

    const params: any = {};

    this._loading$.next(true);

    let apiPrefix = environment.apiPrefix;
    if (this.isAdmin) {
      apiPrefix += '/' + environment.urlAdminPrefix;
      params.merchantId = merchantId;
    }

    return this.httpClient.get(apiPrefix + '/payee/' + email, {
      headers: httpHeaders,
      params
    });
  }

  private _search() {
    console.log('Retrieving Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    // tslint:disable-next-line:no-any
    const params: any = { page: this.page };

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }
    if (this._state.type) {
      params.type = this._state.type;
    }
    // Enable the loading text
    this._loading$.next(true);

    let apiPrefix = environment.apiPrefix;
    if (this.isAdmin) {
      apiPrefix += '/' + environment.urlAdminPrefix;
      params.merchantId = this.merchantId;
    }

    return this.httpClient
      .get<PayeeResponseModel>(apiPrefix + '/payee', {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          if (resp.success) {
            console.log(resp);
            try {
              this.payees = resp.result;
              if (
                typeof this.payees === 'undefined' ||
                this.payees.length === 0
              ) {
                this.payees = [];
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

  updateReportDownloadLink(merchantId: string = '') {
    console.log('DOWNLOADING EXCEL');

    // tslint:disable-next-line:no-any
    const params: any = {
      token: this.authService.getBearerToken()
    };

    if (this.isAdmin) {
      params.merchantId = merchantId;
    }
    //const params: any = { page: this.page };

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
    if (this.isAdmin) {
      newLink =
        environment.apiPrefix +
        '/super-admin/payee/report/download?' +
        paramsSerialized;
    } else {
      newLink =
        environment.apiPrefix + '/payee/report/download?' + paramsSerialized;
    }
    if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Link
    this.reportDownloadLink$.next(newLink);
  }

  addPayee(
    payeeData: FormData,
    merchantId = '',
    payeeId = '',
    isUpdate: boolean
  ) {
    console.log(payeeData);
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });

    let url = environment.apiPrefix + '/payee';
    if (this.isAdmin) {
      url =
        environment.apiPrefix + `/super-admin/payee?merchantId=${merchantId}`;
    }
    if (isUpdate) {
      url = environment.apiPrefix + `/super-admin/payee/${payeeId}`;
      return this.httpClient.patch<AddPayeeResponseModel>(url, payeeData);
    }

    return this.httpClient.post<AddPayeeResponseModel>(url, payeeData);
  }

  public sendIfscRequest(code: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.get(environment.apiPrefix + '/payee/ifsc/' + code, {
      headers: httpHeaders
    });
  }

  public fetchAccountDetails(data: object, merchantId = '') {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    //tslint:disable-next-line:no-any
    const params: any = {};
    let url = environment.apiPrefix + '/payee/bankverification';
    if (this.isAdmin) {
      url = environment.apiPrefix + `/super-admin/payee/bankverification`;
      params.merchantId = merchantId;
    }
    return this.httpClient.post(url, data, {
      headers: httpHeaders,
      params
    });
  }

  public verifyVPA(vpa: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    //tslint:disable-next-line:no-any

    let url = environment.apiPrefix + '/payee/validate-vpa';
    if (this.isAdmin) {
      url = environment.apiPrefix + `/super-admin/payee/validate-vpa`;
    }

    return this.httpClient.post(
      url,
      { vpa },
      {
        headers: httpHeaders
      }
    );
  }

  /*
  private _search(): Observable<SearchResult> {
    const {
      sortColumn,
      sortDirection,
      pageSize,
      page,
      searchTerm
    } = this._state;

    // 1. sort
    let payee = sort(this.payees, sortColumn, sortDirection);

    // 2. filter
    // account = account.filter(account =>
    //   matches(account, searchTerm, this.pipe)
    // );
    const total = payee.length;

    // 3. paginate
    payee = payee.slice(
      (page - 1) * pageSize,
      (page - 1) * pageSize + pageSize
    );

    return of({ payee, total });
  }*/

  get payees$() {
    return this._payee$.asObservable();
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

  get type() {
    return this._state.type;
  }

  set type(type: string) {
    this._set({ type: type });
  }

  updatePayee(
    payeeData: any,
    merchantId: string = '',
    payeeId: string = '',
    isAdmin: boolean = false
  ) {
    let url = environment.apiPrefix + `/payee/${payeeId}`;
    if (this.isAdmin) {
      url = environment.apiPrefix + `/super-admin/payee/${payeeId}`;
    }
    return this.httpClient.patch<AddPayeeResponseModel>(url, payeeData);

  }
}

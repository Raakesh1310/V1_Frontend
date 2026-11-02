import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { SortDirection } from '@modules/tables/directives';
import { TransactionsResponseModel } from '@modules/transactions/models/transactions-response.model';
import payeeAccountType from 'config/payeeAccountType';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import {
  AccountPayeeDetail,
  AccountPayeeInput,
  AccountPayeeRespModel
} from '../models';

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
}

@Injectable()
export class AccountPayeeService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _linkedLoading$ = new BehaviorSubject<boolean>(true);
  private _unlinkedLoading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<string>();
  private _searchUnlinkedPayee$ = new Subject<string>();
  // private _total$ = new BehaviorSubject<number>(0);
  private fieldUpdates = new Subject<void>();

  project = [
    'accountHolder',
    'accountNumber',
    'bankName',
    'bankAddress',
    'ifsc',
    'mobile',
    'email',
    'createdBy',
    'payeeId',
    'createdAt',
    'documents',
    'share',
    'balance',
    'status',
    'accountPayeeId',
    'vpa'
  ];

  private _searchUrl = '';
  private _payees$ = new BehaviorSubject<AccountPayeeDetail[]>([]);
  private _unlinkedpayees$ = new BehaviorSubject<AccountPayeeDetail[]>([]);

  public _searchTerm = '';
  public isAdmin = false;
  private _linked = false;
  private _upi = false;
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {
    this._search$
      .pipe(
        tap(() => {
          this._loading$.next(true);
          this._linkedLoading$.next(true);
        }),
        debounceTime(120),
        switchMap(val => this._search(val)),
        delay(120),
        tap(() => {
          this._loading$.next(false);
          this._linkedLoading$.next(false);
        })
      )
      .subscribe((payeeResp: AccountPayeeRespModel) => {
        this._payees$.next(payeeResp.result || []);
      });

    this._searchUnlinkedPayee$
      .pipe(
        tap(() => {
          this._loading$.next(true);
          this._unlinkedLoading$.next(true);
        }),
        debounceTime(120),
        switchMap(accountType => this._searchUnlinkedPayee(accountType)),
        delay(120),
        tap(() => {
          this._loading$.next(false);
          this._unlinkedLoading$.next(false);
        })
      )
      .subscribe((payeeResp: AccountPayeeRespModel) => {
        this._unlinkedpayees$.next(payeeResp.result || []);

        // this._total$.next(txResponse.allItemsCount);
        // console.log(this._total$.getValue());
      });

    this.isAdmin = this.authService.isSuperAdmin();
  }

  /**
   * ##########################################################################
   *          GET FUNCTIONS
   * ##########################################################################
   */
  // Trigger the Search for entries

  getLinkedPayee(
    accountId: string,
    merchantId = '',
    transferTo: string = '',
  ) {
    this._linked = true;
    this._searchUrl = `${environment.apiPrefix}/account/${accountId}/payee`;
    if (this.isAdmin) {
      this._searchUrl = `${environment.apiPrefix}/super-admin/account/${accountId}/payee?merchantId=${merchantId}`;
    }
    this._search$.next(transferTo);
  }

  getUnlinkedPayee(
    accountId: string,
    term: string,
    merchantId = '',
    accountType: string = payeeAccountType.all
  ) {
    this._searchTerm = term;
    this._linked = false;
    this._searchUrl = `${environment.apiPrefix}/account/${accountId}/payee`;

    if (this.isAdmin) {
      this._searchUrl = `${environment.apiPrefix}/super-admin/account/${accountId}/payee?merchantId=${merchantId}`;
    }
    this._searchUnlinkedPayee$.next(accountType);
  }

  performRefresh(accountId: string, merchantId = '') {
    this._searchUrl = `${environment.apiPrefix}/account/${accountId}/payee`;
    if (this.isAdmin) {
      this._searchUrl = `${environment.apiPrefix}/super-admin/account/${accountId}/payee?merchantId=${merchantId}`;
    }
    this._search$.next();
  }

  performReset() {
    this._payees$.next([]);
    // this._total$.next(0);
  }

  get payees$() {
    return this._payees$.asObservable();
  }

  get unlinkedPayees$() {
    return this._unlinkedpayees$.asObservable();
  }

  get linked() {
    return this._linked;
  }
  // get total$() {
  //   return this._total$.asObservable();
  // }

  get loading$() {
    return this._loading$.asObservable();
  }

  get linkedLoading$() {
    return this._linkedLoading$.asObservable();
  }

  get unlinkedLoading$() {
    return this._unlinkedLoading$.asObservable();
  }

  // get page() {
  //   return this._state.page;
  // }

  // set page(page: number) {
  //   // console.log('page click: ' + page);
  //   this._set({ page });
  //   this._search$.next();
  //   // this.retrieveData().subscribe();
  // }

  // get pageSize() {
  //   return this._state.pageSize;
  // }

  // set pageSize(pageSize: number) {
  //   this._set({ pageSize });
  // }

  // get searchTerm() {
  //   return this._state.searchTerm;
  // }

  // set searchTerm(searchTerm: string) {
  //   this._set({ searchTerm });
  // }

  // /**
  //  * sort functions
  //  */

  // set sortColumn(sortColumn: string) {
  //   this._set({ sortColumn });
  // }

  // set sortDirection(sortDirection: SortDirection) {
  //   this._set({ sortDirection });
  // }

  // private _set(patch: Partial<State>) {
  //   Object.assign(this._state, patch);
  //   this.fieldUpdates.next();
  // }

  private _search(val: any): Observable<TransactionsResponseModel> {
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // Prepare Params
    // tslint:disable-next-line:no-any
    const params: any = {
      linked: true,
      _project: this.project,
      type: val
    };

    if (this._searchTerm.length > 0) {
      params.s = this._searchTerm;
    }

    return this.httpClient
      .get<AccountPayeeRespModel>(this._searchUrl, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          console.log('linked-payees == ', resp.result);
          if (resp.success) {
            try {
              // Update the entries
              resp.result.filter((payee: AccountPayeeDetail) => {
                return payee;
              });
            } catch (e) {
              console.error(e);
            }
          }
          // Disable the Loading text before returning anything
          // this._loading$.next(false);
          return resp;
        }),
        catchError(err => {
          console.error(err);
          // Disable the Loading text before returning anything
          this._loading$.next(false);
          this._linkedLoading$.next(false);
          return throwError(err);
        })
      );
  }

  private _searchUnlinkedPayee(
    accountType: string = payeeAccountType.all
  ): Observable<TransactionsResponseModel> {
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // Prepare Params
    // tslint:disable-next-line:no-any
    const params: any = { linked: false, type: accountType };
    if (this._searchTerm.length > 0) {
      params.s = this._searchTerm;
    }
    return this.httpClient
      .get<AccountPayeeRespModel>(this._searchUrl, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          if (resp.success) {
            try {
              // Update the entries
              resp.result.filter((payee: AccountPayeeDetail) => {
                return payee;
              });
            } catch (e) {
              console.error(e);
            }
          }
          // Disable the Loading text before returning anything
          // this._loading$.next(false);
          return resp;
        }),
        catchError(err => {
          console.error(err);
          // Disable the Loading text before returning anything
          // this._loading$.next(false);
          return throwError(err);
        })
      );
  }

  /**
   * ########################################################################################
   *            POST FUNCTIONS
   * ########################################################################################
   */

  linkPayee(payee: AccountPayeeInput, accountId: string, merchantId = '') {
    Reflect.deleteProperty(payee.payee, 'name');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let url = `${environment.apiPrefix}/account/${accountId}/payee`;
    if (this.isAdmin) {
      url = `${environment.apiPrefix}/super-admin/account/${accountId}/payee`;
      Object.assign(payee, { merchantId });
    }
    return this.httpClient.post<AccountPayeeRespModel>(url, payee, {
      headers: httpHeaders
    });
  }

  deletePayee(accountId: string, payeeId: string, merchantId = '') {
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let url = `${environment.apiPrefix}/account/${accountId}/payee/${payeeId}`;
    if (this.isAdmin) {
      url = `${environment.apiPrefix}/super-admin/account/${accountId}/payee/${payeeId}?merchantId=${merchantId}`;
    }

    return this.httpClient.delete(url, {
      headers: httpHeaders
    });
  }

  patchPayee(accountId: string, payeeIds: string[], merchantId = '') {
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let url = `${environment.apiPrefix}/account/${accountId}/update-payee`;
    if (this.isAdmin) {
      url = `${environment.apiPrefix}/super-admin/account/${accountId}/update-payee?merchantId=${merchantId}`;
    }

    console.log(payeeIds);
    return this.httpClient.patch(url, payeeIds, {
      headers: httpHeaders
    });
  }

  updatePayeeShare(
    accountId: string,
    accountPayeeId: string,
    share: number,
    merchantId = ''
  ) {
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let url = `${environment.apiPrefix}/super-admin/account/${accountId}/payee/${accountPayeeId}?merchantId=${merchantId}`;

    console.log(accountPayeeId);
    return this.httpClient.put(
      url,
      { share },
      {
        headers: httpHeaders
      }
    );
  }
}

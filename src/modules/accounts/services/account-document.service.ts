import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { SortDirection } from '@modules/tables/directives';
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

import { AccountDocumentDetail, AccountDocumentRespModel } from '../models';

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
}

@Injectable()
export class AccountDocumentService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  // private _total$ = new BehaviorSubject<number>(0);
  private fieldUpdates = new Subject<void>();

  private _searchUrl = '';
  private _docs$ = new BehaviorSubject<AccountDocumentDetail[]>([]);
  public isAdmin = false;

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(120),
        switchMap(() => this._search()),
        delay(120),
        tap(() => this._loading$.next(false))
      )
      .subscribe((docsResp: AccountDocumentRespModel) => {
        console.log('Refreshing Transaction list.. with the following data');
        console.log(docsResp);

        this._docs$.next(docsResp.result || []);
        // this._total$.next(txResponse.allItemsCount);
        // console.log(this._total$.getValue());
      });

    this._search$.next();

    this.isAdmin = this.authService.isSuperAdmin();
  }

  /**
   * ##########################################################################
   *          GET FUNCTIONS
   * ##########################################################################
   */
  // Trigger the Search for entries

  performSearch(accountId: string) {
    // this.page = 1
    this._searchUrl = `${environment.apiPrefix}/account/${accountId}/document`;
    if (this.authService.isSuperAdmin()) {
      this._searchUrl = `${environment.apiPrefix}/super-admin/account/${accountId}/document`;
    }
    this._search$.next();
  }

  getBankAccountDocs(bankAccountNo: string) {
    // this.page = 1
    this._searchUrl = `${environment.apiPrefix}/bank-account/${bankAccountNo}/document`;
    if (this.authService.isSuperAdmin()) {
      this._searchUrl = `${environment.apiPrefix}/super-admin/bank-account/${bankAccountNo}/document`;
    }
    // this._search$.next();
    console.log('Retrieving payee Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // Prepare Params
    // tslint:disable-next-line:no-any
    const params: any = {};

    return this.httpClient
      .get<AccountDocumentRespModel>(this._searchUrl, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          if (resp.success) {
            try {
              // Update the entries
              resp.result.filter((doc: AccountDocumentDetail) => {
                // doc.fileURL = this.getDownloadURL(doc.hash);
                return doc;
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

  performRefresh(accountId: string) {
    this._searchUrl = `${environment.apiPrefix}/account/${accountId}/document`;
    this._search$.next();
  }

  performReset() {
    this._docs$.next([]);
    // this._total$.next(0);
  }

  get docs$() {
    return this._docs$.asObservable();
  }

  // get total$() {
  //   return this._total$.asObservable();
  // }

  get loading$() {
    return this._loading$.asObservable();
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

  private _search(): Observable<AccountDocumentRespModel> {
    console.log('Retrieving payee Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // Prepare Params
    // tslint:disable-next-line:no-any
    const params: any = {};

    return this.httpClient
      .get<AccountDocumentRespModel>(this._searchUrl, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          if (resp.success) {
            try {
              // Update the entries
              resp.result.filter((doc: AccountDocumentDetail) => {
                // doc.fileURL = this.getDownloadURL(doc.hash);
                return doc;
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

  uploadBankAccountDocument(bankAccountNo: string, formData: FormData) {
    console.log('adding document to the account');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post<AccountDocumentDetail>(
      `${environment.apiPrefix}/bank-account/${bankAccountNo}/document`,
      formData
    );
  }

  uploadDocument(accountId: string, formData: FormData) {
    console.log('adding document to the account');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post<AccountDocumentDetail>(
      `${environment.apiPrefix}/account/${accountId}/document`,
      formData
    );
  }

  deleteDocument(accountId: string, docId: string) {
    console.log('deleting document from the account');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.delete(
      `${environment.apiPrefix}/account/${accountId}/document/${docId}`
    );
  }

  activateAccount(accountId: string, otp: string = '', merchantId = '') {
    console.log('activating account...');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let url = `${environment.apiPrefix}/account/${accountId}/mark-active`;
    if (this.isAdmin) {
      url = `${environment.apiPrefix}/super-admin/account/${accountId}/active?merchantId=${merchantId}`;

      return this.httpClient.post(
        url,
        { otp },
        {
          headers: httpHeaders
        }
      );
    }

    return this.httpClient.post(
      url,
      { otp },
      {
        headers: httpHeaders
      }
    );
  }
}

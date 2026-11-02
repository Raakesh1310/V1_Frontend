import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MerchantResponseModel } from '@modules/auth/models/merchant.model';
import { AuthService } from '@modules/auth/services';
import { BillResponseModel } from '@modules/merchant/models';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Invoice, InvoiceRespModel } from '../models';

interface State {
  token: string;
  s: string;
  page: number;
  month: number;
  year: number;
  merchants: string[];
}

@Injectable()
export class InvoicesService {
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {
    this.fieldUpdates.subscribe(() => {
      // Update the download report link
      this.updateReportDownloadLink();
    });
  }

  /**
   * list function
   * @returns
   */

  // list bindings
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _invoices$ = new BehaviorSubject<Invoice[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private invoices: Invoice[] = [];
  private _state = {
    s: '',
    page: 1,
    month: 0,
    year: 0,
    merchants: []
  };

  // downlaod bindings

  private reportDownloadLink$ = new BehaviorSubject('#');
  private fieldUpdates = new Subject<void>();

  get invoices$() {
    return this._invoices$.asObservable();
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

  set searchTerm(s: string) {
    this._set({ s });
  }

  get month() {
    return this._state.month;
  }

  set month(month: number) {
    this._set({ month });
  }

  get year() {
    return this._state.year;
  }

  set year(year: number) {
    this._set({ year });
  }

  get merchants() {
    return this._state.merchants;
  }

  set merchants(merchants: string[]) {
    this._set({ merchants });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this.fieldUpdates.next();
    this._search$.next();
  }

  retrieveData() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    let params = new HttpParams();

    params = params.set('page', this.page.toString());

    if (this._state.s.length > 0) {
      params = params = params.set('s', this._state.s);
    }

    if (this._state.month > 0) {
      params = params.set('month', this._state.month.toString());
    }

    if (this._state.year > 0) {
      params = params.set('year', this._state.year.toString());
    }

    if (this._state.merchants.length > 0) {
      this.merchants.forEach(
        merchant => (params = params.append('merchants', merchant))
      );
    }

    return this.httpClient
      .get<InvoiceRespModel>(environment.apiPrefix + '/super-admin/invoices', {
        headers: httpHeaders,
        params
      })
      .pipe(
        map((resp: InvoiceRespModel) => {
          console.log(resp);
          this._total$.next(resp.allItemsCount);
          this._invoices$.next(resp.result);
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

  getInvoices$(): Observable<{}> {
    return of({});
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

  updateReportDownloadLink() {
    let params = {
      token: this.authService.getBearerToken() || '',
      page: this.page
    } as State;

    if (this._state.s.length > 0) {
      params.s = this._state.s;
    }
    if (this._state.month > 0) {
      params.month = this.month;
    }
    if (this._state.year > 0) {
      params.year = this.year;
    }

    if (this._state.merchants.length > 0) {
      params.merchants = this.merchants;
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
      '/super-admin/invoices/report/download?' +
      paramsSerialized;

    if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
      return;
    }
    console.log(newLink);

    // Set the generated New Link
    this.reportDownloadLink$.next(newLink);
  }

  public getBills(merchantId: string, startDate: string, lastDate: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let params = new HttpParams();

    params = params.set('dateFrom', startDate);

    params = params.set('dateTo', lastDate);

    params = params.append('merchants', merchantId);

    return this.httpClient.get<BillResponseModel>(
      environment.apiPrefix + '/super-admin/billing',
      {
        headers: httpHeaders,
        params
      }
    );
  }
}

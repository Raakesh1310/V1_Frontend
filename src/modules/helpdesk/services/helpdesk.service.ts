import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, PipeTransform } from '@angular/core';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { Account } from '@modules/accounts/models';
import { AuthService } from '@modules/auth/services';
import { TransferResponseModel } from '@modules/helpdesk/models/transfer-response.model';
import { SortDirection } from '@modules/transactions/directives';
import { Transaction } from '@modules/transactions/models';
import { TransactionsResponseModel } from '@modules/transactions/models/transactions-response.model';
import { Transfer } from '@modules/transfers/models';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import { environment } from '../../../environments/environment';

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
}

@Injectable()
export class helpdeskService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _requests$ = new BehaviorSubject<Transfer[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private _maxSize$ = new BehaviorSubject<number>(0);

  // Download report link with default link addr #
  private reportDownloadLink$ = new BehaviorSubject('#');
  private fieldUpdates = new Subject<void>();

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: ''
  };

  constructor(
    private pipe: DecimalPipe,
    private httpClient: HttpClient,
    private dateParser: NgbDateParserService,
    private calendar: NgbCalendar,
    private authService: AuthService
  ) {
    // Update Date field limitations

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
        console.log('Refreshing Transfer list.. with the following data');
        console.log(txResponse);

        this._requests$.next(txResponse.result || []);
        this._total$.next(txResponse.allItemsCount);
      });

    this._search$.next();
  }

  // Trigger the Search for entries
  performSearch() {
    this.page = 1;
    this._search$.next();
  }

  performReset() {
    this._requests$.next([]);
    this._total$.next(0);
  }

  get requests$() {
    return this._requests$.asObservable();
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

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this.fieldUpdates.next();
  }

  private _search(): Observable<TransactionsResponseModel> {
    console.log('Retrieving Transaction Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // Prepare Params
    // tslint:disable-next-line:no-any
    const params: any = { page: this.page };

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    return this.httpClient
      .get<TransferResponseModel>(environment.apiPrefix + '/helpdesk', {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          if (resp.success) {
            try {
              // Update the entries
              resp.result.filter((requests: any) => {
                requests.createdAtParsed = new Date(requests.createdAt);
                // transfer.createdAtParsed = new Date(
                //   Date.parse(transfer.createdAt)
                // );
                return requests;
              });

              console.log('After filteration transfers');
              console.log(resp.result);
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

  makeRequest(formData: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    console.log();
    return this.httpClient.post(environment.apiPrefix + '/helpdesk/', formData);
  }
}

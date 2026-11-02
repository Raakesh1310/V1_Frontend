import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SortDirection } from '@modules/tables/directives';
import { SESSION_STORAGE, StorageService } from 'ngx-webstorage-service';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import { ToastService, UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { AuthService } from '@modules/auth/services';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import {
  LoginLockLogsInterface,
  LoginLockLogsResponseModel
} from '../models/lockLogs.model';

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
}

@Injectable()
export class LockLogsService {
  userId: string | undefined;

  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _loginLockLogs$ = new BehaviorSubject<LoginLockLogsInterface[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private _reportDownloadLink$ = new BehaviorSubject('#');
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
    dateToMax: this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0)
  };

  constructor(
    private httpClient: HttpClient,
    private calendar: NgbCalendar,
    private dateParser: NgbDateParserService,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private authService: AuthService,
    @Inject(SESSION_STORAGE) private storageService: StorageService
  ) {
    this.pageSize = 10;
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(120),
        switchMap(() => this._search()),
        delay(120),
        tap(() => this._loading$.next(false))
      )
      .subscribe(response => {
        this._loginLockLogs$.next(response.result);
        this._total$.next(response.allItemsCount);
      });

    this.fieldUpdates.subscribe(() => {
      // Update the download report link
      this.updateReportDownloadLink();
    });
  }

  performSearch(userId: string) {
    this.userId = userId;
    this.fieldUpdates.next();
    this._search$.next();
  }

  retrieveData() {
    this._search$.next();
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
      // add a day to dateTo
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
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

    const newLink =
      environment.apiPrefix +
      `/super-admin/login-lock-logs/${this.userId}/report/download?` +
      paramsSerialized;

    if (!paramsSerialized || this._reportDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Link
    this._reportDownloadLink$.next(newLink);
  }

  private _search(): Observable<LoginLockLogsResponseModel> {
    console.log('Retrieving Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // tslint:disable-next-line:no-any
    const params: any = { page: this.page, pageSize: this.pageSize };

    if (this._state.dateFrom && this._state.dateFrom.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this._state.dateFrom)
      ).toISOString();
    }

    if (this._state.dateTo && this._state.dateTo.year > 2010) {
      // add a day to dateTo
      const newDate = this.utilityService.getNextDayFromNgb(this._state.dateTo);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }

    if (this._state.searchTerm.length > 0) {
      params.s = this._state.searchTerm;
    }

    // if (this.project) {
    //   params._project = this.project;
    // }
    return this.httpClient
      .get<LoginLockLogsResponseModel>(
        environment.apiPrefix + `/super-admin/login-lock-logs/${this.userId}`,
        {
          headers: httpHeaders,
          params: params
        }
      )
      .pipe(
        map(resp => {
          if (resp.success) {
            console.log(resp);
            try {
              resp.result = resp.result || [];

              // For User Profiles
              // resp.result.profiles
              this._loginLockLogs$.next(resp.result);
              this._total$.next(resp.allItemsCount);
            } catch (e) {
              console.error(e);
              // req.errors = [e.message];
            }
          }
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

  get loginLockLogs$() {
    return this._loginLockLogs$.asObservable();
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
    // this._set({ page });
    this._state.page = page;
    this.fieldUpdates.next();
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

  get dateFrom() {
    return this._state.dateFrom;
  }

  get reportDownloadLink$() {
    return this._reportDownloadLink$;
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
  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this.fieldUpdates.next();
    // this._search$.next();
  }
}

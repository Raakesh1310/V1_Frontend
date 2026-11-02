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

import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { BooleanResponseModel } from '@common/models/boolean-response.model';
import { ToastService, UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { AuthService } from '@modules/auth/services';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import { UpdateUserResponseModel } from '../models/update-user.response.model';
import {
  IUserDetail,
  IUserDetailsResponseModel
} from '../models/user-details.model';
import { UserResponseModel } from '../models/user-response.model';
import { User } from '../models/users.model';

interface SearchResult {
  user: User[];
  total: number;
}

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
export class AllUsersService {
  userObject: User | undefined;
  userId: string | undefined;

  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _users$ = new BehaviorSubject<User[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private users: User | undefined;
  private _reportDownloadLink$ = new BehaviorSubject('#');
  private fieldUpdates = new Subject<void>();
  private _isSearchChanged = false;

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
    private authService: AuthService,
    private utilityService: UtilityService,
    private toastService: ToastService,
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
        this._users$.next(response.result);
        this._total$.next(response.allItemsCount);
      });
    this.fieldUpdates.subscribe(() => {
      // Update the download report link
      this.updateReportDownloadLink();
    });
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
      '/super-admin/user/report/download?' +
      paramsSerialized;

    if (!paramsSerialized || this._reportDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Link
    this._reportDownloadLink$.next(newLink);
  }

  performSearch() {
    this._search$.next();
  }

  get reportDownloadLink$() {
    return this._reportDownloadLink$;
  }
  retrieveData() {
    this._search$.next();
  }

  updateUserStatus(_id: string, status: boolean) {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<UpdateUserResponseModel>(
      environment.apiPrefix + '/all-users/updateUserStatus',
      { _id, status },
      { headers: httpHeaders }
    );
  }

  update(_id: string, formData: Partial<IUserDetail>) {
    const url = `${environment.apiPrefix}/super-admin/user/${_id}`;
    return this.httpClient.patch<BooleanResponseModel>(url, formData);
  }

  private _search(): Observable<UserResponseModel> {
    console.log('Retrieving Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // tslint:disable-next-line:no-any
    const params: any = { page: this.page };

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

    if (this._isSearchChanged === true) {
      params.page = 1;
    }

    // if (this.project) {
    //   params._project = this.project;
    // }
    return this.httpClient
      .get<UserResponseModel>(environment.apiPrefix + '/super-admin/user', {
        headers: httpHeaders,
        params: params
      })
      .pipe(
        map(resp => {
          if (resp.success) {
            console.log(resp);
            try {
              resp.result = resp.result || [];

              // For User Profiles

              this._isSearchChanged = false;
              this._users$.next(resp.result);
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

  findUser(_id: string): Observable<IUserDetailsResponseModel> {
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    return this.httpClient
      .get<IUserDetailsResponseModel>(
        environment.apiPrefix + `/super-admin/user/findOne/${_id}`,
        {
          headers: httpHeaders
        }
      )
      .pipe(
        map(resp => {
          return resp;
        }),
        // tslint:disable-next-line:no-any
        catchError((err: any) => {
          console.error(err);
          return throwError(err);
        })
      );
  }

  async changeLocks(
    _id: string,
    fullName: string,
    action: 'attach_lock' | 'remove_lock',
    reason?: string
  ) {
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    const body = {
      reason: reason ?? '',
      changeLockOperation: action,
      userId: _id
    };
    const data = await this.httpClient
      .post(environment.apiPrefix + `/super-admin/user/lock`, body, {
        headers: httpHeaders
      })
      .subscribe(
        (resp: any) => {
          console.log(' Here ' + resp);
          this.performSearch();
          this.showToast(
            'Locked Successfully',
            `Successfully ${
              action === 'attach_lock' ? 'Locked' : 'Activated'
            } ${fullName}`,
            {
              headerClasses: 'bg-success text-white'
            }
          );
        },
        err => {
          console.log(err);
        }
      );
    return data;
  }

  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 5000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }

  get users$() {
    return this._users$.asObservable();
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
    this._isSearchChanged = true;
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
    this._isSearchChanged = true;
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
    this._isSearchChanged = true;
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

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this.fieldUpdates.next();
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@modules/auth/services/auth.service';
import { ProfileResponseModel } from '@modules/profile/models/profile-response.model';
import { UserProfile } from '@modules/profile/models/profile.model';
import { UserProfilesResponseModel } from '@modules/profile/models/user-profiles-response.model';
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
import { PasswordResetModel } from '../models/password-reset.model';

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
}

@Injectable()
export class ProfileAdminService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _userProfiles$ = new BehaviorSubject<UserProfile[]>([]);
  private reportDownloadLink$ = new BehaviorSubject('#');
  private fieldUpdates = new Subject<void>();
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 8,
    searchTerm: ''
  };

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {
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
      .subscribe(response => {
        this._userProfiles$.next(response.result);
        this._total$.next(response.allItemsCount);
      });
  }

  updateReportDownloadLink() {
    // tslint:disable-next-line:no-any
    const params: any = { token: this.authService.getBearerToken() };

    if (this.searchTerm.length > 0) params.s = this.searchTerm;

    let paramsSerialized = '';

    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }

    const newLink =
      environment.apiPrefix +
      '/super-admin/userprofile/report/download?' +
      paramsSerialized;
    console.log(newLink);
    // console.log(paramsSerialized);
    if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
      return;
    }

    // Set the generated New Link
    this.reportDownloadLink$.next(newLink);
  }

  getAllProfiles() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient
      .get<UserProfilesResponseModel>(
        environment.apiPrefix + '/super-admin/userprofile',
        {
          headers: httpHeaders
        }
      )
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  getProfile(_pId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params: any = { _id: _pId };

    return this.httpClient
      .get<ProfileResponseModel>(
        environment.apiPrefix + '/super-admin/userprofile/find',
        {
          headers: httpHeaders,
          params
        }
      )
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  updateProfile(profile: UserProfile) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient
      .post<ProfileResponseModel>(
        environment.apiPrefix + '/super-admin/userprofile',
        JSON.stringify(profile),
        { headers: httpHeaders }
      )
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  verifyDocument<ProfileResponseModel>(
    _pId: string,
    doc: string,
    status: boolean
  ) {
    // setting header
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });

    const params: any = { _id: _pId, field: doc, verified: status };
    // creating request
    return this.httpClient
      .post<ProfileResponseModel>(
        environment.apiPrefix + '/super-admin/userprofile/verifyDoc',
        {
          headers: httpHeaders,
          params
        }
      )
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  // service to upload documents
  uploadService<ProfileResponseModel>(_pId: string, field: string, file: File) {
    // setting header
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });

    // creating form data
    const data = new FormData();
    data.append('file', file);

    // creating request
    return this.httpClient
      .post<ProfileResponseModel>(
        environment.apiPrefix +
          '/super-admin/userprofile/upload/' +
          _pId +
          '/' +
          field,
        data
      )
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  private _search(): Observable<UserProfilesResponseModel> {
    console.log('Retrieving Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    return this.httpClient
      .get<UserProfilesResponseModel>(
        environment.apiPrefix + '/super-admin/userprofile',
        {
          headers: httpHeaders,
          params: { s: this.searchTerm }
        }
      )
      .pipe(
        map(resp => {
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

  performSearch() {
    this._search$.next();
  }

  retrieveData() {
    this._search$.next();
  }

  get userProflies$() {
    return this._userProfiles$.asObservable();
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
    this._search$.next();
  }
}

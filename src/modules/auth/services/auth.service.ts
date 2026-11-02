import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import StorageService from '@common/services/storage.service';
import { ApiCredentialCreateRespModel } from '@modules/auth/models/api-credential-create-resp.model';
import { ApiCredentialDeleteRespModel } from '@modules/auth/models/api-credential-delete-resp.model';
import { ApiCredentialGetRespModel } from '@modules/auth/models/api-credential-get-resp.model';
import { User } from '@modules/auth/models/auth.model';
import { LoginResponseModel } from '@modules/auth/models/login-response.model';
import { LogoutResponseModel } from '@modules/auth/models/logout-response.model';
import { Merchant } from '@modules/auth/models/merchant.model';
import {
  MerchantUser,
  MerchantUserToken
} from '@modules/auth/models/merchantUser.model';
import { RegisterResponseModel } from '@modules/auth/models/register-response.model';
import { UserMerchantResponseModel } from '@modules/auth/models/user-merchant-response.model';
import { RoleAccessPoint } from '@modules/profile/models/roleAccess.model';
import merchantUserRoles from 'config/merchantUserRoles';
import { SESSION_STORAGE } from 'ngx-webstorage-service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { MerchantProfile } from '../models/merchantProfile.model';
import { NonceResponseModel } from '../models/nonce-resp.model';
import { OTPResponseModel } from '../models/otp-response.model';
import { TAndCResponseModel } from '../models/tAndC-response.model';
import { TAndCModel, TAndCStatusEnum } from '../models/tAndC.model';

@Injectable()
export class AuthService {
  private static user: User;
  private static merchant: Merchant;
  private static merchantUser: MerchantUser & MerchantUserToken;
  private static merchantProfile: MerchantProfile;

  private _loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    // @Inject(LOCAL_STORAGE) private localStorage: StorageService,
    private storageService: StorageService,
    @Inject(SESSION_STORAGE) private sessionStorage: StorageService
  ) {
    // Function to store Local Values.
    this.saveInStaticVariable();
  }

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  // Define Constant field
  private readonly MERCHANT_USER = 'merchant_user';

  isOwner() {
    return this.getRole().indexOf(merchantUserRoles.OWNER) > -1;
  }

  isMerchantVerified() {
    // return !AuthService.merchant ? false : AuthService.merchant.verified;
    return true;
  }

  isSuperAdmin() {
    return !AuthService.user
      ? false
      : AuthService.user.isSuperAdmin
      ? AuthService.user.isSuperAdmin
      : false;
  }

  getTAndC(): TAndCModel | null {
    if (!AuthService.user?.tAndC) {
      return null;
    }
    return AuthService.user.tAndC;
  }

  isIndividual() {
    return !AuthService.user ? false : AuthService.user.role === 'individual';
  }

  isMerchantIdSelected(merchantId: string) {
    return !AuthService.merchant
      ? false
      : AuthService.merchant.merchantId === merchantId;
  }

  // isIndividual() {
  //   return !AuthService.merchant
  //     ? false
  //     : AuthService.user.role === 'individual';
  // }

  saveInStaticVariable() {
    try {
      /**
       * Get the Active user
       */
      AuthService.merchantUser = this.storageService.getItem(
        this.MERCHANT_USER
      );
      AuthService.user = AuthService.merchantUser.user;
      AuthService.merchant = AuthService.merchantUser.merchant;
      AuthService.merchantProfile = this.storageService.getItem(
        this.MERCHANT_USER
      ).merchantProfile;

      // console.log(window.location.hostname);
      // console.log('Updated user token: ' + AuthService.merchantUser.token);
    } catch (e) {
      // console.log('Error reading user data in Auth Service');
      // console.log(e);
    }
  }

  saveInStorage(user: MerchantUser & MerchantUserToken) {
    /**
     * Updates in logo field
     */
    user.image = environment.apiHost + user.image;
    this.storageService.setItem(this.MERCHANT_USER, user);
  }

  sendOTP(mobile: string, templateId: string) {
    return this.httpClient
      .get(environment.apiPrefix + `/auth/otp/generate/${mobile}`, {
        params: { templateId }
      })
      .pipe(
        map(resp => {
          console.log('got resp: ', resp);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return err;
        })
      );
  }

  /**
   * Send KYC OTP
   * @param mobile
   * @param templateId
   * @returns
   */
  sendKYCOTP(mobile: string, templateId: string) {
    return this.httpClient
      .get(environment.apiPrefix + `/auth/kyc/otp/${mobile}`, {
        params: { templateId }
      })
      .pipe(
        map(resp => {
          console.log('got resp: ', resp);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return err;
        })
      );
  }

  /**
   * Resend KYC OTP
   * @param mobile
   * @param templateId
   * @returns
   */
  resendKYCOTP(mobile: string, templateId: string) {
    return this.httpClient
      .get(environment.apiPrefix + `/auth/kyc/regenerate-otp/${mobile}`, {
        params: { templateId }
      })
      .pipe(
        map(resp => {
          console.log('got resp: ', resp);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return err;
        })
      );
  }

  /**
   * Resend Login
   * OTP
   * @param user
   * @returns
   */
  resendLoginOTP(user: User): Observable<OTPResponseModel> {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    this._loading$.next(true);
    return this.httpClient
      .post<OTPResponseModel>(
        environment.apiPrefix + `/auth/login/regenerate-otp`,
        user,
        {
          headers: httpHeaders
        }
      )
      .pipe(
        map(resp => {
          this._loading$.next(false);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  /**
   * Get one time encryption
   * token - nonce
   * @returns Observable
   */
  nonce(email: string = ''): Observable<NonceResponseModel> {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    console.log('Logging in User');
    this._loading$.next(true);
    return this.httpClient
      .post<NonceResponseModel>(
        environment.apiPrefix + '/auth/nonce',
        { email: email },
        {
          headers: httpHeaders
        }
      )
      .pipe(
        map(resp => {
          this._loading$.next(false);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  switchMerchant(merchantUserId: string) {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient
      .get<LoginResponseModel>(
        environment.apiPrefix + '/user/merchant/switch/' + merchantUserId,
        { headers: httpHeaders }
      )
      .pipe(
        map(resp => {
          /**
           * Check and update vars
           */
          this.saveInStorage(resp.result);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  getUserMerchants(): Observable<UserMerchantResponseModel> {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.get<UserMerchantResponseModel>(
      environment.apiPrefix + '/user/merchant',
      { headers: httpHeaders }
    );
    // .pipe(
    //   map(resp => {
    //     this._loading$.next(false);
    //     return resp;
    //   }),
    //   catchError(err => {
    //     return throwError(err);
    //   })
    // );
  }

  getBearerToken(): string | null {
    if (!AuthService.merchantUser) {
      return null;
    }
    return AuthService.merchantUser.token;
  }

  getRole(): string[] {
    try {
      if (!AuthService.merchantUser) {
        return [];
      }
      return AuthService.merchantUser.roles.map(v => v.toLowerCase());
    } catch (e) {
      console.log(e);
    }
    return [];
  }

  getDepositAccess(): boolean {
    try {
      if (!AuthService.merchantUser) {
        return false;
      }
      return AuthService.merchantUser.depositTabAccess as boolean;
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  getRoleName(): string | null {
    try {
      if (!AuthService.merchantUser) {
        return null;
      }
      console.log('ROLE NAME ', AuthService.merchantUser.roleName);
      return AuthService.merchantUser.roleName;
    } catch (e) {
      console.log(e);
    }

    return '';
  }

  getAccess(): RoleAccessPoint | {} {
    try {
      if (!AuthService.merchantUser) {
        return {};
      }
      return AuthService.merchantUser.access;
    } catch (e) {
      console.log(e);
    }
    return {};
  }

  getMerchantId(): string | null {
    if (!AuthService.merchant) {
      return null;
    }
    return AuthService.merchant.merchantId;
  }

  getMerchantUserId(): string | null {
    if (!AuthService.merchantUser) {
      return null;
    }
    return AuthService.merchantUser.merchantUserId;
  }

  //Return Merchant Profile data
  getMerchantProfile(): MerchantProfile | null {
    if (!AuthService.merchantProfile) {
      return null;
    }

    return AuthService.merchantProfile;
  }

  getFirstName(): string | null {
    console.log(AuthService.user);
    if (!AuthService.user) {
      return null;
    }

    return AuthService.user.firstName || '';
  }

  setFirstName(str: string | null) {
    if (!AuthService.user) {
      return;
    }

    AuthService.user.firstName = str;
    AuthService.merchantUser.user = AuthService.user;
    this.saveInStorage(AuthService.merchantUser);
  }

  getLastName(): string | null {
    if (!AuthService.user) {
      return null;
    }

    return AuthService.user.lastName || '';
  }

  setLastName(str: string | null) {
    if (!AuthService.user) {
      return;
    }

    AuthService.user.lastName = str;
    AuthService.merchantUser.user = AuthService.user;
    this.saveInStorage(AuthService.merchantUser);
  }

  setMobile(str: string) {
    if (!AuthService.user) {
      return;
    }

    AuthService.user.mobile = str;
    AuthService.merchantUser.user = AuthService.user;
    this.saveInStorage(AuthService.merchantUser);
  }

  getEmail(): string | null {
    if (!AuthService.user) {
      return null;
    }
    return AuthService.user.email;
  }

  getMobile(): string | null {
    if (!AuthService.user) {
      return null;
    }
    return AuthService.user.mobile;
  }

  getLogo(): string | null {
    if (!AuthService.merchantUser) {
      return null;
    }
    return AuthService.merchantUser.image;
  }

  getTitle(): string | null {
    if (!AuthService.merchantUser) {
      return null;
    }
    return AuthService.merchantUser.merchant.title;
  }

  getFullName(): string | null {
    if (!AuthService.user) {
      return null;
    }
    // return AuthService.user.firstName;
    let result = AuthService.user.firstName || '';

    if (AuthService.user.lastName !== '') {
      if (result.length > 0) {
        result += ' ';
      }

      result += AuthService.user.lastName;
    }
    return result;
  }

  register(user: User) {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<RegisterResponseModel>(
      environment.apiPrefix + '/auth/register',
      JSON.stringify(user),
      { headers: httpHeaders }
    );

    // console.log(response);

    // console.log(user);
    // console.log('Success');
    // this.router.navigate(['/auth/login']); // tells them they've been logged out (somehow)
  }

  resendVerificationLink(email: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.get(
      `${environment.apiPrefix}/auth/verifyemail/resend/${email}`,
      { headers: httpHeaders }
    );
  }

  isLoggedIn(): boolean {
    return AuthService.user !== null;
    // return true;
    // return localStorage.getItem(this.USER_LOGGED_IN) === 'true';
  }

  isAdmin(): boolean {
    if (!AuthService.merchantUser) {
      return false;
    }
    // const role = localStorage.getItem(this.USER_ROLE);
    const role = AuthService.merchantUser.role;
    if (!role) {
      return false;
    }
    return role.includes('admin');
  }

  acceptTAndC() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient
      .post<TAndCResponseModel>(
        environment.apiPrefix + '/tAndC',
        {
          status: TAndCStatusEnum.ACCEPTED
        },
        {
          headers: httpHeaders
        }
      )
      .pipe(
        map(resp => {
          if (resp.success) {
            AuthService.user.tAndC = resp.result;
            AuthService.merchantUser.user = AuthService.user;
            this.saveInStorage(AuthService.merchantUser);
          }
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  logOut(navigate: boolean = false, message: string = '') {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Return HttpClient's response
    // @ts-ignore
    return this.httpClient
      .post<LogoutResponseModel>(environment.apiPrefix + '/auth/logout', {
        headers: httpHeaders
      })
      .pipe(
        map(resp => {
          // Got success in response
          if (resp.success) {
            // Remove the Logout string key
            /**
             * Using Secure storage service
             * just to hide the sensitive data
             */
            this.storageService.removeItem(this.MERCHANT_USER);
            this.sessionStorage.setItem(environment.NOTICE_MODAL_VIEWED, false);
            // localStorage.removeItem(this.USER_LOGGED_IN);
            // localStorage.removeItem(this.USER_TOKEN);
            // localStorage.removeItem(this.USER_EMAIL);
            // localStorage.removeItem(this.USER_MOBILE);
            // localStorage.removeItem(this.USER_FIRST_NAME);
            // localStorage.removeItem(this.USER_FULL_NAME);
            // localStorage.removeItem(this.USER_LAST_NAME);
            // localStorage.removeItem(this.USER_LOGO);
            // localStorage.removeItem(this.USER_ROLE);

            if (navigate) {
              this.router.navigate(['/auth/login'], {
                state: { message },
                relativeTo: this.route
              });
            }
          }
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );

    // return resp;
  }

  login(user: User): Observable<LoginResponseModel> {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    console.log('Logging in User');
    this._loading$.next(true);
    return this.httpClient
      .post<LoginResponseModel>(environment.apiPrefix + '/auth/login', user, {
        headers: httpHeaders
      })
      .pipe(
        map(resp => {
          this._loading$.next(false);
          if (resp.success) {
            /**
             * If google authentication is enabled
             * and no totp is provided
             */
            if (resp.result.gAuthRequired) {
              return resp;
            }

            // if (!resp.result.gAuthVerified) {
            //   return resp;
            // }

            /**
             * Using Secure Storage here
             * Just to hide the sensitive data
             */
            this.saveInStorage(resp.result);

            /**
             * Update the static var
             */
            this.saveInStaticVariable();
          }
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  forgotPassword(email: string) {
    return this.httpClient.post(
      `${environment.apiPrefix}/auth/password/forgot/${email}`,
      {}
    ).pipe(
      map((resp: any) => {
        console.log('API Response:', resp); // Optional logging
        return resp; // Pass through success/error responses
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error:', error); // Detailed error logging
        // Re-throw the error with all details for `onSubmit()` to handle
        return throwError(() => error);
      })
    );
  }
  
  resetPassword(password: string, key: string | null) {
    return this.httpClient.post(
      environment.apiPrefix + `/auth/password/forgot/reset`,
      {
        password,
        otp: key
      }
    );
  }

  resetPasswordWithHistory(
    password: string,
    confirmPassword: string,
    otp: string | null,
    mobileOtp: number
  ) {
    return this.httpClient.post(
      environment.apiPrefix + `/auth/password-reset/${otp}`,
      {
        newPassword: password,
        confirmPassword,
        otp: mobileOtp
      }
    );
  }

  validatePasswordResetKey(key: string | null) {
    return this.httpClient.get(
      environment.apiPrefix + `/auth/password-reset/validate/${key}`
    );
  }

  validateKey(key: string | null) {
    return this.httpClient.get(
      environment.apiPrefix + `/auth/password/forgot/validate/${key}`
    );
  }

  getApiCredentials() {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.get<ApiCredentialGetRespModel>(
      environment.apiPrefix + '/api-credential/',
      {
        headers: httpHeaders
      }
    );
  }

  generateApiCredentials() {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<ApiCredentialCreateRespModel>(
      environment.apiPrefix + '/api-credential/',
      {
        headers: httpHeaders
      }
    );
  }

  deleteApiCredentials(id: string) {
    // Hit the call on service
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.delete<ApiCredentialDeleteRespModel>(
      environment.apiPrefix + '/api-credential/' + id,
      {
        headers: httpHeaders
      }
    );
  }
}

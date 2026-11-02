import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GAuthResponseModel } from '@modules/profile/models/g-auth.model';
import { MerchantProfileBankResponseModel } from '@modules/profile/models/merchant-profile-bank-response.model';
import { PostUserInviteResponseModel } from '@modules/profile/models/post-user-invite-response.model';
import { ProfileResponseModel } from '@modules/profile/models/profile-response.model';
import {
  UserProfile,
  UserProfileBank
} from '@modules/profile/models/profile.model';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { NotificationSettingModel } from '../models';
import { TeamResponseModel } from '../models/manage-team';
import { PasswordResetModel } from '../models/password-reset.model';
import { MerchantUserTeamMember } from '@modules/auth/models/merchantUser.model';
import { RBLAccountList, RBLAccountResponse } from '../models/rblAccount';
import { YesAccountList, YesAccountResponse } from '../models/yesAccount';
import { IDFCAccountList, IDFCAccountResponse } from '../models/idfcAccount';
import { HDFCAccountsList } from '../models/hdfcAccounts';
import { IBLAccountList } from '../models/iblAccounts';
import { ICICIAccountList, ICICIAccountResponse } from '../models/iciciAccount';
import { DBSAccountList, DBSAccountResponse } from '../models/dbsAccounts';
import { AxisAccountsList } from '../models/axisAccounts';

@Injectable()
export class ProfileService {
  page = 1;
  searchTerm = '';
  merchantId = '';

  constructor(private httpClient: HttpClient) {}

  getProfile(merchantId: string | null, new_entry: boolean = false) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/merchant/profile?new_entry=${new_entry}`;

    if (merchantId) {
      url = `${environment.apiPrefix}/super-admin/merchant/${merchantId}/profile`;
    }

    return this.httpClient
      .get<ProfileResponseModel>(url, {
        headers: httpHeaders
      })
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

  getDocs(merchantId: string | null) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // let params: any = { _project: ['docBusinessGstOriginal'] };

    let url = `${environment.apiPrefix}/merchant/profile/documents`;

    if (merchantId) {
      url = `${environment.apiPrefix}/super-admin/merchant/${merchantId}/profile/documents`;
    }

    return this.httpClient
      .get<ProfileResponseModel>(url, {
        headers: httpHeaders
        // params
      })
      .pipe(
        map(resp => {
          console.log(resp);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  getBankDetails(merchantId: string | null) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let params = {};
    let url = `${environment.apiPrefix}/merchant/profile/bankdetails`;
    if (merchantId) {
      params = { merchantId };
      url = `${environment.apiPrefix}/super-admin/merchant/${merchantId}/bankdetails`;
    }
    return this.httpClient.get<MerchantProfileBankResponseModel>(url, {
      headers: httpHeaders,
      params
    });
  }

  updateProfile(profile: UserProfile) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<ProfileResponseModel>(
      environment.apiPrefix + '/merchant/profile',
      JSON.stringify(profile),
      { headers: httpHeaders }
    );
  }

  verifyBusiness(merchantId: string | null, profile: UserProfile) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (merchantId) {
      return this.httpClient.patch<ProfileResponseModel>(
        `${environment.apiPrefix}/super-admin/merchant/${merchantId}/profile/business`,
        JSON.stringify(profile),
        { headers: httpHeaders }
      );
    }

    return this.httpClient.post<ProfileResponseModel>(
      `${environment.apiPrefix}/merchant/profile/business`,
      JSON.stringify(profile),
      { headers: httpHeaders }
    );
  }

  verifyPan(merchantId: string | null, profile: UserProfile) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (merchantId) {
      return this.httpClient.patch<ProfileResponseModel>(
        `${environment.apiPrefix}/super-admin/merchant/${merchantId}/profile/pan`,
        JSON.stringify(profile),
        { headers: httpHeaders }
      );
    }

    return this.httpClient.post<ProfileResponseModel>(
      environment.apiPrefix + '/merchant/profile/pan',
      JSON.stringify(profile),
      { headers: httpHeaders }
    );
  }

  verifyAccount(merchantId: string | null, profile: UserProfileBank) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (merchantId) {
      const url1 = `${environment.apiPrefix}/super-admin/merchant/${merchantId}/bankdetails`;
      return this.httpClient.patch<ProfileResponseModel>(
        url1,
        JSON.stringify(profile),
        { headers: httpHeaders }
      );
    }
    const url = `${environment.apiPrefix}/merchant/profile/bank-account`;
    return this.httpClient.post<ProfileResponseModel>(
      url,
      JSON.stringify(profile),
      { headers: httpHeaders }
    );
  }

  activate() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<ProfileResponseModel>(
      environment.apiPrefix + '/merchant/profile/activate',
      { headers: httpHeaders }
    );
  }

  updateBank(profile: UserProfileBank) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.patch<ProfileResponseModel>(
      environment.apiPrefix + '/merchant/profile/bankdetails',
      JSON.stringify(profile),
      { headers: httpHeaders }
    );
  }

  // service to upload documents
  uploadFile(merchantId: string | null, field: string, file: File) {
    // setting header
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });

    let url = `${environment.apiPrefix}/merchant/profile/upload/${field}`;

    if (merchantId) {
      url = `${environment.apiPrefix}/super-admin/merchant/${merchantId}/profile/upload/${field}`;
    }

    // creating form data
    const data = new FormData();
    data.append('file', file);

    // creating request
    return this.httpClient
      .post<ProfileResponseModel>(url, data, {
        reportProgress: true,
        observe: 'events'
      })
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
  deleteFile(merchantId: string | null, fileName: string) {
    // setting header
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let url = `${environment.apiPrefix}/merchant/profile/document/${fileName}`;
    if (merchantId) {
      url = `${environment.apiPrefix}/super-admin/merchant/${merchantId}/profile/document/${fileName}`;
    }

    // creating request
    return this.httpClient.delete<ProfileResponseModel>(url).pipe(
      map(resp => {
        return resp;
      }),
      catchError(err => {
        return throwError(err);
      })
    );
  }

  updatePass(passForm: PasswordResetModel) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.post<ProfileResponseModel>(
      environment.apiPrefix + '/auth/password/reset',
      JSON.stringify(passForm),
      { headers: httpHeaders }
    );
  }

  deleteInvite(email: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    console.log('deleting Invite : ', email);
    return this.httpClient.delete(
      environment.apiPrefix + `/merchant/user/invite/${email}`
    );
  }

  deleteMember(merchantId: string | null, email: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('deleting member : ', email);

    let url = `${environment.apiPrefix}/merchant/user/${email}`;
    const params: any = {};

    if (merchantId) {
      params.merchantId = merchantId;
      url = `${environment.apiPrefix}/super-admin/merchant-user/${email}`;
    }

    return this.httpClient.delete(url, {
      headers: httpHeaders,
      params
    });
  }

  sendInvite(dumped: MerchantUserTeamMember) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let params = {};
    let url = `${environment.apiPrefix}/merchant/user/invite`;

    if (this.merchantId) {
      dumped.merchantId = this.merchantId;
      params = { merchantId: this.merchantId };
      url = `${environment.apiPrefix}/super-admin/merchant-user/invite`;
    }

    // console.log(email, role);
    return this.httpClient.post<PostUserInviteResponseModel>(
      url,
      dumped, // body
      { headers: httpHeaders, params }
    );
  }

  updateMember(
    merchantId: string | null,
    email: string,
    role: string,
    customRoles: object = {}
  ) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const params: any = { role };
    let url = `${environment.apiPrefix}/merchant/user/${email}`;

    if (merchantId) {
      url = `${environment.apiPrefix}/super-admin/merchant-user/${email}`;
      params.merchantId = merchantId;
    }
    return this.httpClient.patch(url, customRoles, {
      headers: httpHeaders,
      params
    });
  }

  getInvites(merchantId: string | null) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const params: any = {};
    let url = `${environment.apiPrefix}/merchant/user/invite`;
    if (this.searchTerm) {
      params.s = this.searchTerm;
    }
    if (merchantId) {
      params.merchantId = merchantId;
      url = `${environment.apiPrefix}/super-admin/merchant-user/invite`;
    }

    return this.httpClient.get<TeamResponseModel>(url, {
      headers: httpHeaders,
      params
    });
  }

  getMembers(merchantId: string | null) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params: any = { page: this.page };
    let url = `${environment.apiPrefix}/merchant/user`;
    if (this.searchTerm) {
      params.s = this.searchTerm;
    }
    if (merchantId) {
      params.merchantId = merchantId;
      url = `${environment.apiPrefix}/super-admin/merchant-user`;
    }

    return this.httpClient.get<TeamResponseModel>(url, {
      headers: httpHeaders,
      params
    });
  }

  loginOTPEnabled() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient
      .get<GAuthResponseModel>(environment.apiPrefix + '/login-otp/isenabled', {
        headers: httpHeaders
      })
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  sendLoginOTP() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient
      .get<GAuthResponseModel>(
        environment.apiPrefix + '/login-otp/generate/otp',
        {
          headers: httpHeaders
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

  gAuthEnabled() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient
      .get<GAuthResponseModel>(environment.apiPrefix + '/g-auth/isenabled', {
        headers: httpHeaders
      })
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  disableLoginOTP(otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient
      .post<GAuthResponseModel>(environment.apiPrefix + '/login-otp/disable', {
        headers: httpHeaders,
        otp
      })
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  disableGAuth(otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient
      .post<GAuthResponseModel>(environment.apiPrefix + '/g-auth/disable', {
        headers: httpHeaders,
        otp
      })
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  enableLoginOTP(otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // const data = new FormData();
    // data.append('otp', otp);

    return this.httpClient
      .post<GAuthResponseModel>(environment.apiPrefix + '/login-otp/enable', {
        headers: httpHeaders,
        otp
      })
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  enableGAuth(otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // const data = new FormData();
    // data.append('otp', otp);

    return this.httpClient
      .post<GAuthResponseModel>(environment.apiPrefix + '/g-auth/enable', {
        headers: httpHeaders,
        otp
      })
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  generateGAuthQR() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // const data = new FormData();
    // data.append('otp', otp);

    return this.httpClient
      .post<GAuthResponseModel>(environment.apiPrefix + '/g-auth/generate/qr', {
        headers: httpHeaders
      })
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  verifyTOTP(otp: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // const data = new FormData();
    // data.append('otp', otp);

    return this.httpClient
      .post<GAuthResponseModel>(environment.apiPrefix + '/g-auth/verify', {
        headers: httpHeaders,
        otp
      })
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  /**
   * Get RBL Bank
   * Details
   * @param merchantId
   * @returns
   */
  getRBLBanksDetails(merchantId: string | null) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let params = {};
    let url = `${environment.apiPrefix}/merchant/profile/bankdetails`;
    if (merchantId) {
      params = { merchantId };
      url = `${environment.apiPrefix}/super-admin/merchant/${merchantId}/bankdetails`;
    }
    return this.httpClient.get<MerchantProfileBankResponseModel>(url, {
      headers: httpHeaders,
      params
    });
  }

  /**
   * Get List of
   * RBL Banks
   * @param merchantId
   * @returns
   */
  getICICIBanksList(merchantId: string = '', isGlobal: boolean = true) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/icici`;

    return this.httpClient
      .get<ICICIAccountList>(url, {
        headers: httpHeaders,
        params: { merchantId: merchantId, isGlobal: isGlobal.toString() }
      })
      .pipe(
        map(resp => {
          console.log(resp);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  /**
   * Create RBL Hard
   * Escrow Account
   * @param accoutData
   * @returns
   */
  createICICIAccount(accoutData: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/icici`;
    return this.httpClient.post<ICICIAccountResponse>(url, accoutData);
  }

  /**
   * Update RBL Hard
   * Escrow Account
   * @param accoutData
   * @returns
   */
  updateICICIAccount(accoutData: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/icici`;
    return this.httpClient.put<ICICIAccountResponse>(url, accoutData);
  }

  /**
   * Get List of
   * RBL Banks
   * @param merchantId
   * @returns
   */
  getRBLBanksList(merchantId: string = '', isGlobal: boolean = true) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/rbl`;

    return this.httpClient
      .get<RBLAccountList>(url, {
        headers: httpHeaders,
        params: { merchantId: merchantId, isGlobal: isGlobal.toString() }
      })
      .pipe(
        map(resp => {
          console.log(resp);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  /**
   * Create RBL Hard
   * Escrow Account
   * @param accoutData
   * @returns
   */
  createRBLAccount(accoutData: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/rbl`;
    return this.httpClient.post<RBLAccountResponse>(url, accoutData);
  }

  /**
   * Update RBL Hard
   * Escrow Account
   * @param accoutData
   * @returns
   */
  updateRBLAccount(accoutData: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/rbl`;
    return this.httpClient.put<RBLAccountResponse>(url, accoutData);
  }

  /**
   * Get List of
   * Yes Banks
   * @param merchantId
   * @returns
   */
  getYesBanksList(merchantId: string = '', isGlobal: boolean = true) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/yes`;

    return this.httpClient
      .get<YesAccountList>(url, {
        headers: httpHeaders,
        params: { merchantId: merchantId, isGlobal: isGlobal.toString() }
      })
      .pipe(
        map(resp => {
          console.log(resp);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  /**
   * Get List of
   * Yes Banks
   * @param merchantId
   * @returns
   */
  getIDFCBanksList(merchantId: string = '', isGlobal: boolean = true) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/idfc`;

    return this.httpClient
      .get<IDFCAccountList>(url, {
        headers: httpHeaders,
        params: { merchantId: merchantId, isGlobal: isGlobal.toString() }
      })
      .pipe(
        map(resp => {
          console.log(resp);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  getHDFCBanksList(merchantId: string = '', isGlobal: boolean = true) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/hdfc`;

    return this.httpClient
      .get<HDFCAccountsList>(url, {
        headers: httpHeaders,
        params: { merchantId: merchantId, isGlobal: isGlobal.toString() }
      })
      .pipe(
        map(resp => {
          return resp;
        }),
        catchError(err => {
          return throwError(err);
        })
      );
  }

  getIBLBanksList(merchantId: string = '', isGlobal: boolean = true) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/ibl`;

    return this.httpClient
      .get<IBLAccountList>(url, {
        headers: httpHeaders,
        params: { merchantId: merchantId, isGlobal: isGlobal.toString() }
      })
      .pipe(
        map(resp => {
          console.log(resp);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  getDBSBanksList(merchantId: string = '', owner: string = 'ncome') {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/dbs`;

    return this.httpClient
      .get<DBSAccountList>(url, {
        headers: httpHeaders,
        params: { merchantId: merchantId, owner }
      })
      .pipe(
        map(resp => {
          console.log(resp);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  getAxisBanksList(merchantId: string = '', owner: string = 'ncome') {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/axis`;

    return this.httpClient
      .get<AxisAccountsList>(url, {
        headers: httpHeaders,
        params: { merchantId: merchantId, owner }
      })
      .pipe(
        map(resp => {
          console.log(resp);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  /**
   * Create YES Hard
   * Escrow Account
   * @param accoutData
   * @returns
   */
  createYesAccount(accoutData: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/yes`;
    return this.httpClient.post<YesAccountResponse>(url, accoutData);
  }

  /**
   * Create IDFC Hard
   * Escrow Account
   * @param accountData
   * @returns
   */
  createIDFCAccount(accountData: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/idfc`;
    return this.httpClient.post<IDFCAccountResponse>(url, accountData);
  }

  /**
   * Create DBS Hard
   * Escrow Account
   * @param accountData
   * @returns
   */
  createDBSAccount(accountData: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/dbs`;
    return this.httpClient.post<DBSAccountResponse>(url, accountData);
  }

  /**
   * Create Axis Hard
   * Escrow Account
   * @param accountData
   * @returns
   */
  createAxisAccount(accountData: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/axis`;
    return this.httpClient.post<DBSAccountResponse>(url, accountData);
  }

  /**
   * update Axis Hard
   * Escrow Account
   * @param accountData
   * @returns
   */
  updateAxisAccount(accountNo: string, accountData: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/axis/${accountNo}`;
    return this.httpClient.patch<DBSAccountResponse>(url, accountData);
  }

  /**
   * Update YES Hard
   * Escrow Account
   * @param accoutData
   * @returns
   */
  updateYesAccount(accoutData: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/yes`;
    return this.httpClient.put<YesAccountResponse>(url, accoutData);
  }

  /**
   * Update IDFC Hard
   * Escrow Account
   * @param accountData
   * @returns
   */
  updateIDFCAccount(accountData: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/idfc`;
    return this.httpClient.put<IDFCAccountResponse>(url, accountData);
  }

  /**
   * Update DBS Hard
   * Escrow Account
   * @param accountData
   * @returns
   */
  updateDBSAccount(accountData: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/hard-escrow/dbs`;
    return this.httpClient.put<DBSAccountResponse>(url, accountData);
  }

  getNotificationSettings() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // const data = new FormData();
    // data.append('otp', otp);

    return this.httpClient.get<NotificationSettingModel>(
      environment.apiPrefix + '/user/setting/notification',
      {
        headers: httpHeaders
      }
    );
  }

  updateNotificationSettings(type: string, active: boolean) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // const data = new FormData();
    // data.append('otp', otp);

    return this.httpClient.patch(
      environment.apiPrefix +
        `/user/setting/notification/${type}/action/${active}`,
      {
        headers: httpHeaders
      }
    );
  }

  updateMobile(mobile: number, otp: number) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    console.log(mobile, otp);

    return this.httpClient.patch(
      environment.apiPrefix + `/user/mobile`,
      { mobile, otp: otp.toString() },
      {
        headers: httpHeaders
      }
    );
  }

  getAuthorizers(merchantId: string, type: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/merchant/${merchantId}/${type}`;

    if (merchantId) {
      url = `${environment.apiPrefix}/super-admin/merchant/${merchantId}/${type}`;
    }

    return this.httpClient.get<ProfileResponseModel>(url, {
      headers: httpHeaders
    });
  }

  getMerchantAuthorizers(merchantId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/merchant/${merchantId}/merchant-authorizers`;

    return this.httpClient.get<ProfileResponseModel>(url, {
      headers: httpHeaders
    });
  }

  generateXapiKey(merchantId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/x-api`;
    return this.httpClient
      .post<any>(url, {
        headers: httpHeaders,
        merchantId: merchantId
      })
      .pipe(
        map(resp => {
          console.log(resp);
          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  generateEncryptionKey() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = `${environment.apiPrefix}/super-admin/webhook/encryption-key`;
    return this.httpClient.get<any>(url, {
      headers: httpHeaders
    });
  }
}

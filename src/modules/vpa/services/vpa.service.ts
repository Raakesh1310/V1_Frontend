import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';

@Injectable()
export class VpaService {
  public isAdmin = false;
  page = 1;
  constructor(
    private httpClient: HttpClient,
    private authservice: AuthService
  ) {
    this.isAdmin = this.authservice.isSuperAdmin();
  }

  getVpa$(): Observable<{}> {
    return of({});
  }

  /**
   * Activate VPA
   * @param data
   * @returns
   */
  activate(data: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let apiPrefix = environment.apiPrefix;
    if (this.isAdmin) {
      apiPrefix += '/' + environment.urlAdminPrefix;
    }

    let parameters = {
      headers: httpHeaders
    };

    if (Object.keys(data).length) {
      Object.assign(parameters, { params: data });
    }

    let action: string = data.action;

    delete data.action;

    return this.httpClient.post(
      apiPrefix + '/vpa/' + action.toLowerCase(),
      data,
      {
        headers: httpHeaders
      }
    );
  }

  /**
   * Get list of all VPAs
   * @param data
   * @returns
   */
  getAllVPAs(data: object) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let apiPrefix = environment.apiPrefix;
    if (this.isAdmin) {
      apiPrefix += '/' + environment.urlAdminPrefix;
    }

    let parameters = {
      headers: httpHeaders
    };

    if (Object.keys(data).length) {
      Object.assign(parameters, { params: data });
    }
    return this.httpClient.get(apiPrefix + '/vpa', parameters);
  }

  /**
   *
   * @param vpa
   * @param isAdmin
   * @returns
   */
  public verifyVPA(
    vpa: string,
    hardEscrowAccountNumber: string,
    isAdmin?: boolean,
    bankName: string = ''
  ) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    //tslint:disable-next-line:no-any

    let url = environment.apiPrefix + '/payee/validate-vpa';
    if (isAdmin) {
      url = environment.apiPrefix + `/super-admin/payee/validate-vpa`;
    }

    return this.httpClient.post(
      url,
      { vpa, accountNumber: hardEscrowAccountNumber, bankName },
      {
        headers: httpHeaders
      }
    );
  }
}

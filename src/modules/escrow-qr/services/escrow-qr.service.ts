import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';

@Injectable()
export class EscrowQrService {
  isAdmin = false;
  constructor(
    private httpClient: HttpClient,
    private authservice: AuthService
  ) {
    this.isAdmin = this.authservice.isSuperAdmin();
  }

  getEscrowQr$(): Observable<{}> {
    return of({});
  }

  getEscrowQrList(data: object) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    // const params = { ...data };
    // Object.assign({ page: this.page });

    let apiPrefix = environment.apiPrefix;
    if (this.isAdmin) {
      apiPrefix += '/' + environment.urlAdminPrefix;
      //   params.merchantId = this.merchantId;
    }

    let parameters = {
      headers: httpHeaders
    };

    if (Object.keys(data).length) {
      Object.assign(parameters, { params: data });
    }
    return this.httpClient.get(apiPrefix + '/escrow-qr', parameters);
  }

  getEscrowQrData(refId: string, data: object) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let url = environment.apiPrefix;
    if (this.isAdmin) {
      url += '/' + environment.urlAdminPrefix + '/escrow-qr/' + refId;
    } else {
      url +=  '/escrow-qr/' + refId + '/payment'
    }

    let parameters = {
      headers: httpHeaders
    };

    if (Object.keys(data).length) {
      Object.assign(parameters, { params: data });
    }
    return this.httpClient.get(url , parameters);
  }

  createEscrowQR(data: object) {
    let apiPrefix = environment.apiPrefix;
    if (this.isAdmin) {
      apiPrefix += '/' + environment.urlAdminPrefix;
    }

    return this.httpClient.post(apiPrefix + '/escrow-qr', data);
  }

  getUPILinkedMerchants(searchTerm = '') {
    let url =
      environment.apiPrefix +
      '/' +
      environment.urlAdminPrefix +
      '/merchant/escrow-qr';

    if (searchTerm) {
      url = url + '?s=' + searchTerm;
    }

    return this.httpClient.get(url);
  }

  getUPILinkedAccounts(merchantId: string = '', searchTerm = '') {
    let url = environment.apiPrefix;
    if (this.isAdmin) {
      url =
        url +
        '/' +
        environment.urlAdminPrefix +
        '/account/escrow-qr?merchantId=' +
        merchantId;
    } else {
      url = url + '/' + '/account/escrow-qr';
    }

    if (searchTerm) {
      url = url + '?s=' + searchTerm;
    }
    return this.httpClient.get(url);
  }
}

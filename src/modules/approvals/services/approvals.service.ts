import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '@modules/auth/services';
import { environment } from 'environments/environment';
import HttpParameters from '@common/interfaces/httpparams.interface';

@Injectable()
export class ApprovalsService {
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) { }

  getSingleApprovalData(url: string, params: any) {
    // @ts-ignore
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.authService.getBearerToken()
    });
    return this.httpClient.get(url, {
      headers: httpHeaders,
      params,
      reportProgress: true
    });
  }

  getBulkApprovalData(url: string, params: any) {
    // @ts-ignore
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.authService.getBearerToken()
    });
    return this.httpClient.get(url, {
      headers: httpHeaders,
      params,
      reportProgress: true
    });
  }

  //Get Single Transfers of a batch
  getSingleBulkApproval(batchId: string) {
    let url = environment.apiPrefix + '/multi-transfer/approvals/' + batchId;
    if (this.authService.isSuperAdmin()) {
      url =
        environment.apiPrefix +
        '/super-admin/multi-transfer/approvals/' +
        batchId;
    }
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.authService.getBearerToken()
    });
    return this.httpClient.get(url, { headers: httpHeaders });
  }

  getMerchantApprovalData(url: string, params: HttpParameters, _merchantId: string = '') {
    // @ts-ignore
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.authService.getBearerToken()
    });
    if (_merchantId !== '') {
      params['merchantId'] = _merchantId;
    }
    return this.httpClient.get(url, {
      headers: httpHeaders,
      params,
      reportProgress: true
    });
  }

  approvalAction(url: string, body: object) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.authService.getBearerToken()
    });
    return this.httpClient.post(url, body, {
      headers: httpHeaders,
      reportProgress: true
    });
    //   .pipe(
    //   catchError((error: HttpErrorResponse, caught: Observable<HttpEvent<Object>>) => {
    //     let errorMessage = '';
    //     if (error.error instanceof ErrorEvent) {
    //       // Get client-side error
    //       errorMessage = error.error.message;
    //     } else {
    //       // Get server-side error
    //       errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    //     }
    //     console.log(errorMessage);
    //     return throwError(errorMessage);
    //   })
    // );
  }

  bulkApprovalAction(url: string, body: object) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.authService.getBearerToken()
    });
    return this.httpClient.post(url, body, { headers: httpHeaders });
  }

  singleBulkApprovalAction(url: string, body: object) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.authService.getBearerToken()
    });
    return this.httpClient.patch(url, body, { headers: httpHeaders });
  }

  getPayeeApprovalData(url: string, params: HttpParameters, _merchantId: string = '') {
    // @ts-ignore
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.authService.getBearerToken()
    });
    if (_merchantId !== '') {
      params['merchantId'] = _merchantId;
    }
    return this.httpClient.get(url, {
      headers: httpHeaders,
      reportProgress: true
    });
  }
}

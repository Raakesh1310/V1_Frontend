import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import { KycSubmitInterface } from '../models/kyc-model';

@Injectable()
export class AllUsersService {
  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService
  ) {}

  /**
   * Getting all KYC Entries for table.
   */
  getKycTableEntries(params: any, isSuperAdmin: boolean) {
    let url =
      environment.apiPrefix +
      (isSuperAdmin ? '/super-admin/kyclink' : '/kyclink');
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.get(url, { headers: httpHeaders, params });
  }

  /**
   * Getting Single KYC Entry.
   */
  getSingleEntry(id: string, params: any, isSuperAdmin: boolean = false) {
    let url =
      environment.apiPrefix +
      (isSuperAdmin ? `/super-admin/kyclink/${id}` : `/kyclink/${id}`);
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.get(url, { headers: httpHeaders, params });
  }

  /**
   * Generate KYC Link
   */
  createKYCLink(formData: FormData, isSuperAdmin: boolean) {
    let url =
      environment.apiPrefix +
      (isSuperAdmin ? '/super-admin/kyclink' : '/kyclink');
    return this.httpClient.post(url, formData);
  }

  /**
   * Creating merchant when KYC completed.
   */
  createMerchantFromKyc(id: string) {
    let url = environment.apiPrefix + `/super-admin/merchant/${id}`;
    // const httpHeaders = new HttpHeaders({
    //   'Content-Type': 'application/json'
    // });
    return this.httpClient.post(url, {});
  }

  /**
   * Updating particular entry based on body attributes.
   */
  patchKycData(crnId: string, body: object, params: any) {
    let url = environment.apiPrefix + `/super-admin/kyclink/${crnId}`;
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
      // 'Authorization': 'Bearer ' + this.authService.getBearerToken()
    });
    return this.httpClient.patch(url, body, { headers: httpHeaders, params });
  }

  /**
   * Getting pan info.
   */
  getPanData(url: string, params: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post(url, { headers: httpHeaders, params });
  }

  /**
   * Sending KYC Documents.
   */
  postDocuments(url: string, formData: FormData) {
    return this.httpClient.post(url, formData);
  }

  /**
   * Deleting particular documents.
   */
  deleteDocuments(crnId: string, documentId: string) {
    let url = environment.apiPrefix + `/kyclink/${crnId}/${documentId}`;
    return this.httpClient.delete(url);
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
}

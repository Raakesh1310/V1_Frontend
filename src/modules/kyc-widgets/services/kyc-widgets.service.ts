import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '@modules/auth/services';
import { kycDataModel, KycDocuments, promoterDetails } from '@modules/kyc-widgets/models';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import { environment } from '../../../environments/environment';

@Injectable()
export class KycWidgetsService {

  constructor(private httpClient: HttpClient, private authService: AuthService,
              private toastService: ToastService) {

  }

  getKycData(url: string, params: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.get(url, { headers: httpHeaders, params });
  }

  getPanData(url: string, params: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'

    });
    return this.httpClient.post(url, { headers: httpHeaders, params });
  }

  patchKycData(crnId: string, body: object, params: any) {
    let url = environment.apiPrefix + `/kyclink/${crnId}`;
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
      // 'Authorization': 'Bearer ' + this.authService.getBearerToken()
    });
    return this.httpClient.patch(url, body, { headers: httpHeaders, params });
  }

  postDocuments(url: string, formData: FormData) {
    return this.httpClient.post(url, formData);
  }

  deleteDocuments(crnId: string, documentId: string) {
    let url = environment.apiPrefix + `/kyclink/${crnId}/${documentId}`;
    return this.httpClient.delete(url);
  }

  docsDownload(docHash: string) {
    let url = `${environment.apiHost}/uploads/kyc/${docHash}`;
    return this.httpClient.get(url);
  }

  otpVerify(body: object, crnId: string) {
    let url = environment.apiPrefix + `/kyclink/${crnId}` + '/verify';
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post(url, body, { headers: httpHeaders });
  }


  digioRequestGeneration(body : object, crnId : string) {
    let url = environment.apiPrefix + `/kyclink/${crnId}/digilocker-request`;
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.httpClient.post(url,body,{headers : httpHeaders});
  }

  digioTokenRegeneration(body : object, crnId : string) {
    let url = environment.apiPrefix + `/kyclink/${crnId}/regenerate-token`;
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.httpClient.post(url,body,{headers : httpHeaders});
  }

  digioRequestStatus(requestId : string, crnId: string) {
    let url = environment.apiPrefix + `/kyclink/${crnId}/digio-kycdetails/${requestId}`;
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.httpClient.get(url,{headers : httpHeaders});
  }

  /**
   * Verifying Account holders name with ifsc and Account Number
   */
  verifyAccountHoldersName(crnId: string,body : object, params : object) {
    let url = environment.apiPrefix + `/kyclink/${crnId}/verify/bank-account`;
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.httpClient.post(url,body,{headers : httpHeaders});
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

  kycDataMapping(resp: any): kycDataModel {
    let arr: promoterDetails[] = [];
    let docs: KycDocuments[] = [];
    //let data: kycDataModel;
    resp.promoters.forEach((it: any) => {
      arr.push({
        aadhar: it.aadhaarNo,
        aadharBackImageName: it.aadhaarBackName,
        aadharBackUploaded: it.aadhaarNo !== '',
        aadharFrontImageName: it.aadhaarFrontName,
        aadharFrontUploaded: it.aadhaarNo !== '',
        aadharVerifiedAt: '',
        din: it.din,
        name: it.name,
        pan: it.pan,
        panImageName: it.panFrontName,
        panUploaded: it.panVerified,
        panVerifiedAt: it.panVerifiedAt,
        aadhaarVerified: false,
        aadharBack: it.aadhaarBack,
        aadharFront: it.aadhaarFront,
        panFront: it.panFront,
        designation: it.designation,
        email: it.email,
      });
    });

    if (resp.documents && resp.documents.length > 0) {
      resp.documents.forEach((it: any) => {
        docs.push({
          documentId: it.documentId,
          hash: it.hash,
          name: it.name,
          type: it.type
        });
      });
    }

    return {
      address: resp.address,
      annualRevenue: resp.annualRevenue,
      bankAccNumber: resp.bankAccNumber,
      bankBranch: resp.bankBranch,
      bankName: resp.bankName,
      bankVerifiedAt: resp.bankVerifiedAt,
      bankVerified: resp.bankVerified,
      businessName: resp.businessName,
      businessPan: resp.businessPan,
      businessPanVerified: resp.businessPanVerified,
      businessPanVerifiedAt: resp.businessPanVerifiedAt,
      businessType: resp.businessType,
      cin: resp.cin,
      cinVerified: resp.cinVerified,
      cinVerifiedAt: resp.cinVerifiedAt,
      crnId: resp.crnId,
      dateOfRegistration: resp.dateOfRegistration,
      email: resp.email,
      gstVerified: resp.gstVerified,
      gstVerifiedAt: resp.gstVerifiedAt,
      gstin: resp.gstin,
      gstAvailable: resp.gstAvailable,
      ifsc: resp.ifsc,
      importExport: resp.importExport,
      kycLink: resp.kycLink,
      mobile: resp.mobile,
      name: resp.name,
      status: resp.status,
      promoters: arr,
      documents: docs,
      mobileVerified: resp.mobileVerified,
      page: resp.page,
      sendKycToEmail: resp.sendKycToEmail,
      sendKycToName: resp.sendKycToName,
      industryType: resp.industryType,
      companyStatus: resp.companyStatus,
      natureOfBusiness: resp.natureOfBusiness,
      latitude: resp.latitude,
      longitude: resp.longitude,
      digioRequestId: resp.digioRequestId,
      digioTokenId: resp.digioTokenId,
      digioTokenTimeStamp: resp.digioTokenTimeStamp,
      accountHolderName: resp.accountHolderName,
      cinAddress: resp.cinAddress,
    };
  }

}

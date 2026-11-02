import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@modules/auth/services';
import { ActivatedRoute } from '@angular/router';
import { AllUsersService } from '@modules/all-users/services';

@Component({
  selector: 'sbpro-kyc-detail-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kyc-detail-admin-page.component.pug',
  styleUrls: ['kyc-detail-admin-page.component.scss']
})
export class KycDetailAdminPageComponent implements OnInit {
  documentTab = true;
  data: any = {};
  promoters = [];
  documents = [];
  businessName = '';
  email = '';
  name = '';
  industryType = '';
  businessType = '';
  importExport = false;
  annualRevenue = '';
  mobile = 0;
  status = '';
  accountHolderName = '';
  bankAccNumber = '';
  ifsc = '';
  bankName = '';
  bankVerified = '';
  bankVerifiedAt = '';
  gstin = '';
  gstAvailable = true;
  gstVerified = '';
  gstVerifiedAt = '';
  businessPan = '';
  businessPanVerified = '';
  businessPanVerifiedAt = '';
  cin = '';
  cinVerified = '';
  cinVerifiedAt = '';
  address = '';
  dateOfRegistration = '';
  panHash = '';
  panName = '';
  panDocId = '';
  companyPanHash = '';
  companyPanName = '';
  companyPanDocId = '';
  coiHash = '';
  coiName = '';
  coiDocId = '';
  selfieHash = '';
  selfieName = '';
  selfieDocId = '';
  gstHash = '';
  gstName = '';
  gstDocId = '';
  brHash = '';
  brName = '';
  brDocId = '';
  chequeName = '';
  chequeHash = '';
  chequeDocId = '';
  companyStatus = '';
  latitude = '';
  longitude = '';
  dataLoaded = false;
  sendKycToEmail = '';
  sendKycToName = '';

  private isSuperAdmin = false;


  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private allUserService: AllUsersService,
  ) {
    this.isSuperAdmin = this.authService.isSuperAdmin();
  }


  ngOnInit() {
    this.allUserService.getSingleEntry(this.route.snapshot.params.id, {}, this.isSuperAdmin).subscribe(
      (resp: any) => {
        console.log('RESPONSE 1', resp);
        if (resp.success) {
          this.data = resp.result;
          console.log('resp ==>>', resp);
          this.documents = resp.result.documents;
          this.promoters = resp.result.promoters;
          this.gstin = resp.result.gstin;
          this.gstAvailable = resp.result.gstAvailable;
          this.gstVerified = resp.result.gstVerified;
          this.gstVerifiedAt = resp.result.gstVerifiedAt;
          this.businessPan = resp.result.businessPan;
          this.businessPanVerified = resp.result.businessPanVerified;
          this.businessPanVerifiedAt = resp.result.businessPanVerifiedAt;
          this.cin = resp.result.cin;
          this.companyStatus = resp.result.companyStatus;
          this.cinVerified = resp.result.cinVerified;
          this.cinVerifiedAt = resp.result.cinVerifiedAt;
          this.address = resp.result.address;
          this.businessType = resp.result.businessType;
          this.latitude = resp.result.latitude;
          this.longitude = resp.result.longitude;
          this.sendKycToEmail = resp.result.sendKycToEmail;
          this.sendKycToName = resp.result.sendKycToName;
          if (this.businessType === 'Individual') {
            this.documentTab = false;
          }
          this.industryType = resp.result.industryType;
          this.dateOfRegistration = resp.result.dateOfRegistration;
          this.businessName = resp.result.businessName;
          this.accountHolderName = resp.result.accountHolderName;
          this.bankAccNumber = resp.result.bankAccNumber;
          this.ifsc = resp.result.ifsc;
          this.bankName = resp.result.bankName;
          this.bankVerified = resp.result.bankVerified;
          this.bankVerifiedAt = resp.result.bankVerifiedAt;
          this.email = resp.result.email;
          this.name = resp.result.name;
          this.mobile = resp.result.mobile;
          this.industryType = resp.result.industryType;
          this.businessType = resp.result.businessType;
          this.importExport = resp.result.importExport;
          this.annualRevenue = resp.result.annualRevenue;
          this.businessName = resp.result.businessName;
          this.status = resp.result.status;
          this.documents = resp.result.documents;
          for (let doc of resp.result.documents) {
            if (doc.type === 'gst') {
              this.gstHash = doc.hash;
              this.gstName = doc.name;
              this.gstDocId = doc.documentId;
            }

            if (doc.type === 'coi') {
              this.coiHash = doc.hash;
              this.coiName = doc.name;
              this.coiDocId = doc.documentId;
            }

            if (doc.type === 'pan') {
              this.panHash = doc.hash;
              this.panName = doc.name;
              this.panDocId = doc.documentId;
            }

            if (doc.type === 'companyPan') {
              this.companyPanHash = doc.hash;
              this.companyPanName = doc.name;
              this.companyPanDocId = doc.documentId;
            }

            if (doc.type === 'br') {
              this.brHash = doc.hash;
              this.brName = doc.name;
              this.brDocId = doc.documentId;
            }

            if (doc.type === 'cheque') {
              this.chequeHash = doc.hash;
              this.chequeName = doc.name;
              this.chequeDocId = doc.documentId;
            }

            if (doc.type === 'userSelfie') {
              this.selfieHash = doc.hash;
              this.selfieName = doc.name;
              this.selfieDocId = doc.documentId;
            }
          }
          this.dataLoaded = true;
          this.cdr.detectChanges();
        }
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
        } else {
          console.log(err.error.errors);
        }
        this.dataLoaded = true;
        this.cdr.detectChanges();
      }
    );

    this.cdr.detectChanges();
  }
}

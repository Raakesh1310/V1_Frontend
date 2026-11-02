import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from '@common/services';
import { AllUsersService } from '@modules/all-users/services';
import { AuthService } from '@modules/auth/services';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';

@Component({
  selector: 'sbpro-kyc-basic-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kyc-basic-details.component.pug',
  styleUrls: ['kyc-basic-details.component.scss']
})
export class KycBasicDetailsComponent implements OnInit {
  data: any = {};
  @Input() businessName = '';
  @Input() email = '';
  @Input() name = '';
  @Input() sendKycToEmail = '';
  @Input() sendKycToName = '';
  @Input() mobile = 0;
  @Input() industryType = '';
  @Input() businessType = '';
  @Input() importExport!: boolean;
  @Input() annualRevenue = '';
  @Input() status = '';
  @Input() latitude = '';
  @Input() longitude = '';
  @Input() selfieHash = '';
  editOnly = false;
  errors: string[] = [];
  importExportText = '';
  crnId = '';
  isLoading = false;
  s3FolderName = S3FolderName.KYC;

  constructor(
    private _location: Location,
    private allUserService: AllUsersService,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private utilityService: UtilityService
  ) {}

  ngOnInit() {
    console.log('jbcejcbejcb ', this.importExport);
    this.importExportText = this.importExport ? 'Yes' : 'No';
    this.crnId = this.route.snapshot.params.id;
    // const httpHeaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   Authorization: 'Bearer ' + this.authService.getBearerToken()
    // });
    // let url =
    //   environment.apiPrefix +
    //   `/super-admin/kyclink/${this.route.snapshot.params.id}`;
    // this.httpClient.get(url, { headers: httpHeaders }).subscribe(
    //   (resp: any) => {
    //     console.log('RESPONSE 1', resp);
    //     if (resp.success) {
    //       console.log(resp);
    //       this.data = resp.result;
    //       this.cdr.detectChanges();
    //     }
    //   },
    //   err => {
    //     console.log('ERROR FROM API SIDE ', err);
    //     if (err.status === 0) {
    //       console.log('Connection Error');
    //     } else {
    //       console.log(err.error.errors);
    //     }
    //     this.cdr.detectChanges();
    //   }
    // );
    // console.log('Basic details', this.basicDetails);
    // console.log('Business Name', this.businessName);
    // this.cdr.detectChanges();
    console.log('business name', this.businessName);
    // this.cdr.detectChanges();
  }

  /**
   * Setting dropdown value on industry type.
   */
  setIndustryType(value: string) {
    console.log(value);
    this.importExportText = value;
    this.cdr.detectChanges();
  }

  /**
   * Updating values on database.
   */
  async updateData() {
    if (this.editOnly) {
      this.isLoading = true;
      this.cdr.detectChanges();
      let body = {
        sendKycToName: this.sendKycToName,
        businessName: this.businessName,
        importExport: this.importExportText === 'Yes',
        mobile: this.mobile,
        sendKycToEmail: this.sendKycToEmail,
        businessType: this.businessType
      };
      console.log(body);
      let params = {};
      await this.allUserService
        .patchKycData(this.crnId, body, params)
        .subscribe(
          (resp: any) => {
            console.log('DATA PATCHED ON BUSINESS DETAILS ', resp);
            if (resp.success) {
              let toastHead = 'Updated';
              let toastBody = 'Successfully Updated Values';
              this.allUserService.showToast(toastHead, toastBody, {
                headerClasses: 'bg-success text-white'
              });
            } else {
              console.log('ERROR ', resp.errors);
              let toastHead = 'Error';
              let toastBody = resp.errors;
              this.allUserService.showToast(toastHead, toastBody, {
                headerClasses: 'bg-danger text-white'
              });
            }
            this.isLoading = false;
            this.editOnly = false;
            this.cdr.detectChanges();
          },
          err => {
            console.log('ERROR FROM API SIDE ', err);
            let toastHead = 'Error';
            let toastBody = '';
            if (err.status === 0) {
              console.log('Connection Error');
              toastBody = 'Connection Error';
              this.errors.push('Connection Error');
            } else {
              console.log(err.error.errors);
              toastBody = err.error.errors;
              this.errors.push(err.error.errors);
            }
            this.editOnly = false;
            this.isLoading = false;
            this.allUserService.showToast(toastHead, toastBody, {
              headerClasses: 'bg-danger text-white'
            });
            this.cdr.detectChanges();
          }
        );
    }
  }

  goBack() {
    this._location.back();
  }

  downloadSelfie($event: Event) {
    $event.preventDefault();
    console.log('SELFIE HASH ', this.selfieHash);
    return this.utilityService.downloadFile(
      $event,
      this.selfieHash,
      this.s3FolderName,
      this.selfieHash
    );
    // return environment.apiHost + '/uploads/kyc/' + this.selfieHash;
  }
}

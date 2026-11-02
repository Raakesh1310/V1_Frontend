import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  Input
} from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@modules/auth/services';
import { ActivatedRoute } from '@angular/router';
import { AllUsersService } from '@modules/all-users/services';

@Component({
  selector: 'sbpro-kyc-business-kyc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kyc-business-kyc.component.pug',
  styleUrls: ['kyc-business-kyc.component.scss']
})
export class KycBusinessKycComponent implements OnInit {
  data: any = {};
  @Input() name = '';
  @Input() gstin = '';
  @Input() gstAvailable = '';
  @Input() gstVerified = '';
  @Input() gstVerifiedAt = '';
  @Input() businessPan = '';
  @Input() businessPanVerified = '';
  @Input() businessPanVerifiedAt = '';
  @Input() cin = '';
  @Input() cinVerified = '';
  @Input() cinVerifiedAt = '';
  @Input() address = '';
  @Input() businessType = '';
  @Input() industryType = '';
  @Input() dateOfRegistration = '';
  @Input() businessName = '';
  @Input() companyStatus = '';
  gstEdit = false;
  panEdit = false;
  errors: string[] = [];
  crnId = '';
  panLoading = false;
  gstLoading = false;
  isLoading = false;

  constructor(
    private _location: Location,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private allUserService: AllUsersService
  ) {
  }

  ngOnInit() {
    console.log(this.gstin);
    this.crnId = this.route.snapshot.params.id;
  }

  verifyPan() {
    if (this.panEdit) {
      this.patchKycData({ 'businessPan': this.businessPan }, 'Pan');
    }
  }

  verifyGst() {
    if (this.gstEdit) {
      this.patchKycData({ 'gstin': this.gstin }, 'Gst');
    }
  }

  /**
  * Updating values on database.
  */
  patchKycData(body: object, docType: string) {
    if (docType === 'Pan') {
      this.panLoading = true;
    } else {
      this.gstLoading = true;
    }
    this.cdr.detectChanges();
    let params = {};
    this.errors = [];
    this.allUserService.patchKycData(this.crnId, body, params).subscribe(
      (resp: any) => {
        console.log('DATA PATCHED ON BUSINESS KYC ', resp);
        if (resp.success) {
          let toastHead = 'Updated';
          let toastBody = docType === 'Pan' ? `Pan number ${this.businessPan} successfully Updated.` :
            `Gst number ${this.gstin} successfully Updated.`;
          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
        } else {
          this.errors.push(resp.errors);
          let toastHead = 'Error';
          let toastBody = resp.errors;
          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          console.log('ERROR ', resp.errors);
        }
        if (docType === 'Pan') {
          this.panLoading = false;
          this.panEdit = false;
        } else {
          this.gstLoading = false;
          this.gstEdit = false;
        }
        this.cdr.detectChanges();
      },
      err => {
        let toastHead = 'Error';
        let toastBody = '';
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          toastBody = 'Connection Error';
          this.errors.push('Connection Error');
        } else {
          console.log(err.error.errors);
          toastBody = err.error.errors;
          this.errors.push(err.error.errors);
        }
        this.allUserService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        if (docType === 'Pan') {
          this.panLoading = false;
          this.panEdit = false;
        } else {
          this.gstLoading = false;
          this.gstEdit = false;
        }
        this.cdr.detectChanges();
      }
    );
  }

  goBack() {
    this._location.back();
  }

  getDate(s: string): string {
    let date = new Date(s);
    return `${date.getDate()}/${date.getMonth() +
    1}/${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`;
  }

}

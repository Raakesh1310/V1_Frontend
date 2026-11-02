import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { kycDataModel } from '@modules/kyc-widgets/models';
import { KycWidgetsService } from '@modules/kyc-widgets/services';
import { environment } from '../../../../environments/environment';
import { UtilityService } from '@common/services';
import businessTypes from 'config/businessTypes';

@Component({
  selector: 'sbpro-business-kyc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './business-kyc.component.pug',
  styleUrls: ['./business-kyc.component.scss']
})
export class BusinessKycComponent implements OnInit {
  @Output() valueChange = new EventEmitter();
  @Output() kycDataUpgrade = new EventEmitter();
  @Input() userKycData!: kycDataModel;
  @ViewChild('inputFile') inputFile!: ElementRef;
  @ViewChild('parentElement') chip!: ElementRef;
  businessPan = '';
  gstIn = '';
  cin = '';
  @Input() crnId = '';
  panVerified = false;
  gstVerified = false;
  cinVerified = false;
  panVerifiedAt = '';
  gstVerifiedAt = '';
  cinVerifiedAt = '';
  moveToNextPage = false;
  businessAddress = '';
  cinAddress = '';
  errors: string[] = [];
  panImageName = 'pan';
  seventeen = 17;
  thirty = 30;
  panLoading = false;
  cinLoading = false;
  gstLoading = false;
  hideGstCheck = false;
  gstAvailable = true;
  businessType = '';

  imgSrc: string | ArrayBuffer | null = '';
  private modalRef?: NgbModalRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private kycService: KycWidgetsService,
    private utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    console.log('BUSINESS KYC DATA ', this.userKycData);
    this.updateValueFromKycData(this.userKycData);
  }

  updateValueFromKycData(data: kycDataModel) {
    this.businessPan = data.businessPan;
    this.gstIn = data.gstin;
    this.cin = data.cin;
    this.gstVerified = data.gstVerified;
    this.hideGstCheck = data.gstAvailable;
    this.gstAvailable = data.gstAvailable;
    this.gstVerifiedAt = data.gstVerifiedAt;
    this.panVerified = data.businessPanVerified;
    this.panVerifiedAt = data.businessPanVerifiedAt;
    this.cinVerified = data.cinVerified;
    this.cinVerifiedAt = data.cinVerifiedAt;
    this.userKycData.natureOfBusiness = data.natureOfBusiness;
    this.userKycData.companyStatus = data.companyStatus;
    this.userKycData.dateOfRegistration = data.dateOfRegistration;
    this.businessAddress = data.address;
    this.cinAddress = data.cinAddress;
    this.businessType = data.businessType;
    if (
      this.userKycData.businessType === 'Company' ||
      this.userKycData.businessType === 'LLP'
    ) {
      if (this.cinVerified && this.panVerified) {
        this.moveToNextPage = true;
      }
    } else if (this.userKycData.businessType === 'Sole Proprietor') {
      this.panVerified = true;
      // this.cinVerified = false;
      if (this.gstAvailable && this.gstVerified) {
        this.moveToNextPage = true;
      } else if (!this.gstAvailable && !this.gstVerified) {
        this.moveToNextPage = true;
      } else {
        this.moveToNextPage = false;
      }
    } else if (this.userKycData.businessType === 'PartnerShip') {
      if (!this.gstAvailable && this.panVerified) {
        this.moveToNextPage = true;
      } else if (this.gstAvailable && this.gstVerified && this.panVerified) {
        this.moveToNextPage = true;
      } else {
        this.moveToNextPage = false;
      }
    } else {
      if (this.panVerified && this.gstVerified) {
        this.moveToNextPage = true;
      }
    }
    this.cdr.detectChanges();
  }

  openModal(alertDialog: any, event: any) {
    //console.log(event);
    this.modalRef = this.modalService.open(alertDialog, {
      backdrop: 'static',
      centered: true
    });
  }

  closeModal() {
    this.panVerified = true;
    this.modalRef?.close();
    this.cdr.detectChanges();
    //this.ngOnInit();
  }

  dismissModal() {
    this.modalRef?.close();
    this.imgSrc = '';
  }

  closeChip() {
    this.chip.nativeElement.style.display = 'none';
    this.panVerified = false;
    this.imgSrc = '';
    this.cdr.detectChanges();
    //console.log(this.chip.nativeElement.style.display);
  }

  /**
   * OCR related function.
   */
  uploadData(event: any) {
    console.log(event);
    if (event.target) {
      let fileName = event.target.files[0].name; // getting image name....
      this.panImageName =
        fileName.length > 5 ? fileName.substring(0, 5) : fileName;
      const reader = new FileReader();
      reader.onload = e => (this.imgSrc = reader.result);
      reader.readAsDataURL(event.target.files[0]); // setting img Src value, therefore it is affecting document side...
      console.log(this.imgSrc);
    } else {
      let fileName = event.name; // getting image name....
      this.panImageName =
        fileName.length > 5 ? fileName.substring(0, 5) : fileName;
      const reader = new FileReader();
      // @ts-ignore
      reader.onload = e => (this.imgSrc = reader.result);
      reader.readAsDataURL(event); // setting img Src value, therefore it is affecting document side...
      console.log(this.imgSrc);
    }
  }

  /**
   * Verifying pan temporary as OCR implementation will be there in future.
   */
  verifyPan() {
    if (this.businessPan) {
      this.patchKycData({ businessPan: this.businessPan }, 'pan');
    }
  }

  verifyGst() {
    if (this.gstIn) {
      this.patchKycData({ gstin: this.gstIn }, 'gstIn');
    }
  }

  // PAN Verification. 10 digits alphanumeric.
  panVerification(e: any) {
    try {
      let validation = e.key.toLowerCase().match(/[a-zA-Z0-9 ]+/);

      let phoneNumber = this.businessPan?.length + (validation ? 1 : 0);
      let val = phoneNumber > 10;
      if (
        (!val && validation) ||
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowLeft'
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  // GST Verification. 15 digits alphanumeric.
  gstVerification(e: any) {
    try {
      let validation = e.key.toLowerCase().match(/[a-zA-Z0-9 ]+/);

      let gstNo = this.gstIn?.length + (validation ? 1 : 0);
      let val = gstNo > 15;
      if (
        (!val && validation) ||
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowLeft'
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  // GST Verification. 15 digits alphanumeric.
  cinVerification(e: any) {
    try {
      let validation = e.key.toLowerCase().match(/[a-zA-Z0-9 ]+/);

      let cin = this.cin?.length + (validation ? 1 : 0);
      // let val = phoneNumber > 15;
      if (
        (cin && validation) ||
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowLeft'
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  gstChanged(event: any) {
    console.log(event.target.checked);
    this.gstVerified = event.target.checked;
    this.hideGstCheck = !event.target.checked;
    // this.gstTick.nativeElement.style.display = "none !important";
    // console.log(this.gstTick);
    this.patchKycData({ gstAvailable: !event.target.checked });
    this.cdr.detectChanges();
  }

  verifyCin() {
    if (this.cin) {
      if (this.cin.length < 7) {
        console.log('CIN: Minimum length should be 7');
        let toastHead = 'Verification Error';
        let toastBody = 'CIN: Minimum length should be 7';
        this.kycService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
        return;
      }
      this.patchKycData({ cin: this.cin }, 'cin');
    }
  }

  moveBack() {
    this.valueChange.emit('Business Details');
  }

  moveForward() {
    if (this.moveToNextPage) {
      this.valueChange.emit('Bank Details');
    }
  }

  inputChange(value: string, type: string) {
    if (type === 'businessPan') {
      this.businessPan = value;
    } else if (type === 'GST') {
      this.gstIn = value;
    } else {
      this.cin = value;
    }
    this.cdr.detectChanges();
  }

  patchKycData(body: object, page?: string) {
    let doc = page;
    // if(!this.moveToNextPage) {
    //   return;
    // }
    // let body = {
    //   "businessPan" : this.businessPan,
    //   "gstin": this.gstIn,
    //   "cin": this.cin,
    //   "businessPanVerified": this.panVerified,
    //   "gstVerified": this.gstVerified,
    //   "cinVerified": this.cinVerified,
    // };

    // @ts-ignore
    this.loading(page, true);
    this.cdr.detectChanges();

    if (this.userKycData.businessType === 'PartnerShip') {
      if (page === 'gstIn' && this.panVerified) {
        Object.assign(body, {
          page: 'Bank Details'
        });
      }
    }

    if (this.userKycData.businessType === 'Sole Proprietor') {
      if (page === 'gstIn' && this.panVerified) {
        Object.assign(body, {
          page: 'Bank Details'
        });
      }
    }

    if (
      this.userKycData.businessType === 'Company' ||
      this.userKycData.businessType === 'LLP'
    ) {
      if (page === 'cin' && this.gstVerified) {
        Object.assign(body, {
          page: 'Bank Details'
        });
      }
      if (page === 'gstIn' && this.cinVerified) {
        Object.assign(body, {
          page: 'Bank Details'
        });
      }
    } else {
      if (page === 'gstIn' && this.panVerified) {
        Object.assign(body, {
          page: 'Bank Details'
        });
      }
    }
    let params = {};
    //let url = environment.apiPrefix + `/kyclink/${this.crnId}`;
    this.errors = [];
    this.kycService.patchKycData(this.crnId, body, params).subscribe(
      (resp: any) => {
        console.log('DATA PATCHED ON BUSINESS KYC ', resp);
        if (resp.success) {
          let kycData: kycDataModel = this.kycService.kycDataMapping(
            resp.result
          );
          kycData.documents = this.userKycData.documents;
          this.updateValueFromKycData(kycData);
          let toastHead = 'Document Uploaded.';
          let toastBody = '';
          if (doc === 'pan' && kycData.businessPanVerified) {
            toastBody = 'PAN Verified Successfully.';
          }
          if (doc === 'gstIn' && kycData.gstVerified) {
            toastBody = 'GST Verified Successfully.';
          }
          if (
            doc === 'cin' &&
            kycData.cinVerified &&
            this.businessType !== businessTypes.llp
          ) {
            toastBody = 'CIN Saved Successfully.';
          }
          if (
            doc === 'cin' &&
            kycData.cinVerified &&
            this.businessType === businessTypes.llp
          ) {
            toastBody = 'CIN Saved Successfully.';
          }
          if (doc) {
            this.kycService.showToast(toastHead, toastBody, {
              headerClasses: 'bg-success text-white'
            });
          }
          this.kycDataUpgrade.emit(kycData);
        } else {
          // this.isLoading = false;
          this.errors.push(resp.errors);
          console.log('ERROR ', resp.errors);
          let toastHead = 'Verification Error';
          let toastBody = resp.errors;

          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.errors.push(resp.errors);
        }
        // @ts-ignore
        this.loading(page, false);
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        let toastHead = 'Verification Error';
        let toastBody = '';
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
          toastBody = 'Connection Error';
        } else {
          console.log(err.error.errors);
          toastBody = err.error.errors;
          if (
            page === 'pan' &&
            err.error.errors.toString() === 'Missing or invalid parameter'
          ) {
            toastBody = 'Invalid PAN.';
          }
          this.errors.push(err.error.errors);
        }
        // @ts-ignore
        this.loading(page, false);
        this.kycService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
      }
    );
  }

  loading(page: string, flag: boolean) {
    if (page === 'pan') {
      this.panLoading = flag;
    } else if (page === 'gstIn') {
      this.gstLoading = flag;
    } else {
      this.cinLoading = flag;
    }
  }
}

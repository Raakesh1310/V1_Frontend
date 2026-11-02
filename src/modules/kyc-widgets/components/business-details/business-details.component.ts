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
import {
  kycDataModel,
  kycOptions,
  promoterDetails,
  statuses
} from '@modules/kyc-widgets/models';
import { KycWidgetsService } from '@modules/kyc-widgets/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-business-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './business-details.component.pug',
  styleUrls: ['./business-details.component.scss']
})
export class BusinessDetailsComponent implements OnInit {
  @Output() valueChange = new EventEmitter();
  @Output() kycType = new EventEmitter();
  @Output() kycDataUpgrade = new EventEmitter();
  @Input() userKycData!: kycDataModel;
  errors: string[] = [];
  businessName: string = '';
  annualRevenue: string = '';
  validationRevenue: string = '';
  industryType = '';
  importExport = false;
  businessType = '';
  userCoordinates = { latitude: '', longitude: '' };
  @Input() crnId = '';
  kycOption: kycOptions[] = [];
  moveToNextPage = false;
  modalRef?: NgbModalRef;
  @ViewChild('warningMessage', { static: true }) warningMessage?: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private kycService: KycWidgetsService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.kycOption = [
      // {
      //   isSelected: false,
      //   text: 'Individual'
      // },
      {
        isSelected: false,
        text: 'Company'
      },
      {
        isSelected: false,
        text: 'PartnerShip'
      },
      {
        isSelected: false,
        text: 'Sole Proprietor'
      },
      {
        isSelected: false,
        text: 'LLP'
      }
    ];
    this.updateValueFromKycData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        //console.log(position.coords);
        this.userCoordinates.latitude = position.coords.latitude.toString();
        this.userCoordinates.longitude = position.coords.longitude.toString();
        console.log(position.coords);
      });
    }
  }

  updateValueFromKycData() {
    console.log('BUSINESS DETAILS VALUE ', this.userKycData);
    //if(this.userKycData.annualRevenue && this.userKycData.businessName && this.userKycData.businessType) {
    // this.industryType = this.userKycData.
    this.annualRevenue =
      this.userKycData.annualRevenue === 0
        ? ''
        : this.userKycData.annualRevenue?.toString();
    this.businessName = this.userKycData.businessName;
    this.importExport = this.userKycData.importExport || false;
    this.businessType = this.userKycData.businessType;
    this.industryType = this.userKycData.industryType;
    this.kycOption.forEach(it => {
      if (it.text === this.businessType) {
        it.isSelected = true;
      }
    });
    // if (this.businessType === 'Individual') {
    //   this.kycType.emit('Individual');
    // }
    this.checkForArrowColor();
    this.cdr.detectChanges();
    //}
  }

  openWarningModal() {
    this.modalRef = this.modalService.open(this.warningMessage, {
      backdrop: 'static'
    });
    this.modalRef.result.then(resp => {
      this.modalRef?.close();
    });
  }

  selectKycType(selectedVal: kycOptions) {
    if (this.userKycData.page === '') {
      this.kycOption.forEach(val => {
        val.isSelected = val.text === selectedVal.text;
        if (val.isSelected) {
          this.businessType = val.text;
        }
      });
      if (selectedVal.text === 'Individual') {
        this.businessType = 'Individual';
        this.kycType.emit('Individual');
      }
    }
    this.checkForArrowColor();
    this.cdr.detectChanges();
  }

  async moveToKyc() {
    //this.valueChange.emit('Business KYC');
    if (
      this.userCoordinates.latitude === '' &&
      this.userCoordinates.longitude === ''
    ) {
      this.openWarningModal();
      return;
    }
    if (
      !this.annualRevenue ||
      !this.businessType ||
      !this.businessName ||
      !this.industryType
    ) {
      return;
    }
    let body = {
      annualRevenue: this.annualRevenue,
      businessName: this.businessName,
      importExport: this.importExport,
      businessType: this.businessType,
      industryType: this.industryType,
      latitude: this.userCoordinates.latitude || '',
      longitude: this.userCoordinates.longitude || '',
      status: statuses.InProgress.toString(),
      page: 'Business KYC'
    };
    let params = {};
    //let url = environment.apiPrefix + `/kyclink/${this.crnId}`;
    this.errors = [];
    await this.kycService.patchKycData(this.crnId, body, params).subscribe(
      (resp: any) => {
        console.log('DATA PATCHED ON BUSINESS DETAILS ', resp);
        if (resp.success) {
          let kycData: kycDataModel = this.kycService.kycDataMapping(
            resp.result
          );
          kycData.documents = this.userKycData.documents;
          this.kycDataUpgrade.emit(kycData);
          this.valueChange.emit('Business KYC');
          this.cdr.detectChanges();
        } else {
          // this.isLoading = false;
          // this.errors.push(resp.errors);
          this.cdr.detectChanges();
          console.log('ERROR ', resp.errors);
        }
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
        } else {
          console.log(err.error.errors);
          this.errors.push(err.error.errors);
        }
        this.cdr.detectChanges();
      }
    );
  }

  // patchKycData() {
  //   let body = {};
  //   let params = {};
  //   let url = '';
  //   this.errors = [];
  //   this.kycService.patchKycData(url,body, params).subscribe(
  //     (resp: any) => {
  //       console.log('APPROVALS ', resp);
  //       if (resp.success) {
  //         this.valueChange.emit('Business KYC');
  //         //this.cdr.detectChanges();
  //       } else {
  //         // this.isLoading = false;
  //         // this.errors.push(resp.errors);
  //         this.cdr.detectChanges();
  //         console.log('ERROR ', resp.errors);
  //       }
  //     },
  //     err => {
  //       console.log('ERROR FROM API SIDE ', err);
  //       if (err.status === 0) {
  //         console.log('Connection Error');
  //         this.errors.push('Connection Error');
  //       } else {
  //         console.log(err.error.errors);
  //         this.errors.push(err.error.errors);
  //       }
  //       this.cdr.detectChanges();
  //     }
  //   );
  // }

  setPages(value: string) {
    console.log(value);
    this.industryType = value;
    this.cdr.detectChanges();
  }

  inputValueChange(value: string, type: string) {
    console.log(value);
    if (type === 'Business Name') {
      this.businessName = value;
    }
    this.checkForArrowColor();
    this.cdr.detectChanges();
  }

  onlyFloatAllowed(event: any) {
    let value = event.key;
    if (
      value === 'Backspace' ||
      value === 'Delete' ||
      value === 'ArrowRight' ||
      value === 'ArrowLeft'
    ) { 
      return true;
    }

    value = event.target.value + event.key;
    let validation = /^[-+]?[0-9]*\.?[0-9]*$/.test(value);

    if (
      validation
    ) {
      this.validationRevenue = value
      this.checkForArrowColor();
      this.cdr.detectChanges();
      return true;
    }
    // else {
    //   this.annualRevenue = /^[-+]?[0-9]*\.?[0-9]*$/.test(value) ? value : this.annualRevenue;
    // }
    // this.checkForArrowColor();
    // this.cdr.detectChanges();
    return false
  }

  importChange(event: any) {
    console.log(event.target.checked);
    this.importExport = event.target.checked;
    this.cdr.detectChanges();
  }

  closeModal(acceptance: boolean) {
    this.modalRef?.close(acceptance);
  }

  checkForArrowColor() {
    this.moveToNextPage =
      this.businessType !== '' &&
      this.businessName !== '' &&
      this.annualRevenue !== '' &&
      this.industryType !== '';
    this.cdr.detectChanges();
  }
}

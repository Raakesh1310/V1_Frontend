import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { UtilityService } from '@common/services';
import { kycDataModel, promoterDetails } from '@modules/kyc-widgets/models';
import { KycWidgetsService } from '@modules/kyc-widgets/services';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment';

enum type {
  pan,
  aadharFront,
  aadharBack
}

@Component({
  selector: 'sbpro-signatory-kyc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signatory-kyc.component.pug',
  styleUrls: ['./signatory-kyc.component.scss']
})
export class SignatoryKycComponent implements OnInit {
  @Output() valueChange = new EventEmitter();
  @Output() kycDataUpgrade = new EventEmitter();
  @Input() userKycData!: kycDataModel;
  @Input() crnId = '';
  promotersData: promoterDetails[] = [];
  partnerShip = 'partnerShip';
  signatoryName = '';
  signatoryDin = '';
  signatoryDes = 'Partner';
  allDocumentsUploaded = false;
  imgSrc: string | ArrayBuffer | null = '';
  errors: string[] = [];
  notDeletable = true;
  apiStartUrl = environment.apiPrefix;
  pan = 'pan';
  isLoading = false;
  Ac_Front = 'Ac_Front';
  Ac_Back = 'Ac_Back';
  private modalRef?: NgbModalRef;
  emailErrorsList: any = {};
  downloadFolderName = S3FolderName.KYC;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private kycService: KycWidgetsService,
    private utilityService: UtilityService
  ) {}

  downloadFile($event: Event, docHash: string) {
    this.utilityService.downloadFile($event, docHash, this.downloadFolderName);
  }
  ngOnInit(): void {
    console.log('KYC DATA ON SIGNATORY ', this.userKycData);
    this.notDeletable = this.userKycData?.promoters[0]?.panUploaded;
    this.promotersData = [];
    this.updateValueFromKycData(this.userKycData);
  }

  updateValueFromKycData(data: kycDataModel) {
    if (data.promoters && data.promoters.length > 0) {
      this.promotersData = data.promoters;
      this.cdr.detectChanges();
    }
    this.checkForArrowColor();
  }

  openModal(alertDialog: any, event: any) {
    console.log(event);
    console.log('User KYC DATA ', this.userKycData);
    this.modalRef = this.modalService.open(alertDialog, {
      backdrop: 'static',
      centered: true
    });
  }

  helperCode(event: any, doc: type, promoter: promoterDetails) {
    let fileName = '';
    let file: File;
    const reader = new FileReader();
    if (event.target) {
      fileName = event.target.files[0].name; // getting image name....
      file = event.target.files[0];
      if (file.size > 5e6) {
        // Give an error message here.
        let toastHead = 'Failure';
        let toastBody = 'Uploaded file is greater than 5 MB.';

        this.kycService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        return;
      }
    } else {
      fileName = event.name; // getting image name in case of drag/drop....
      file = event;
    }
    if (doc === type.pan) {
      reader.onload = e => (this.imgSrc = reader.result);
      reader.readAsDataURL(file); // setting img Src value, therefore it is affecting document upload modal side...
      this.postKycDocs(file, this.pan, promoter);
      // console.log(this.imgSrc);
    } else if (doc === type.aadharFront) {
      reader.onload = e => (this.imgSrc = reader.result);
      reader.readAsDataURL(file); // setting img Src value, therefore it is affecting document side...
      this.postKycDocs(file, this.Ac_Front, promoter);
    } else {
      // @ts-ignore
      reader.onload = e => (this.imgSrc = reader.result);
      reader.readAsDataURL(file); // setting img Src value, therefore it is affecting document side...
      this.postKycDocs(file, this.Ac_Back, promoter);
    }
  }

  /**
   * PAN CODE...
   */
  uploadPanData(event: any, promoter?: promoterDetails) {
    console.log(event);
    // @ts-ignore
    this.helperCode(event, type.pan, promoter);
    this.cdr.detectChanges();
  }

  closePanModal(event?: any, promoter?: promoterDetails) {
    // we are getting promoter from signatory Component and event from document component..
    console.log(event);
    console.log(promoter);
    if (event[1]) {
      // @ts-ignore
      this.verifyPan(event[1], promoter).then((r: any) => {
        console.log(this.promotersData);
        this.cdr.detectChanges();
      });
    }
  }

  dismissPanModal(promoter?: promoterDetails) {
    // @ts-ignore
    this.deleteKycDoc(promoter?.panDocId, this.pan, promoter).then((r: any) => {
      console.log('PROMOTERS DATA AFTER DELETING DOCS ', this.promotersData);
    });
    this.imgSrc = '';
    this.modalRef?.close();
    this.cdr.detectChanges();
  }

  /**
   * AADHAR FRONT CODE...
   */
  uploadAadharFrontData(event: any, promoter?: promoterDetails) {
    console.log(event);
    // @ts-ignore
    this.helperCode(event, type.aadharFront, promoter);
    this.cdr.detectChanges();
  }

  closeAadharFrontModal(event?: any, promoter?: promoterDetails) {
    // we are getting promoter from signatory Component and event from document component..
    console.log(event);
    console.log(promoter);
    if (event.toString().length === 12) {
      // @ts-ignore
      promoter?.aadharFrontUploaded = true;
      // @ts-ignore
      promoter?.aadhar = event;
      this.imgSrc = '';
      this.modalRef?.close();
      this.cdr.detectChanges();
      this.checkForArrowColor();
      console.log(this.promotersData);
    } else {
      let toastHead = 'Error';
      let toastBody = `Please enter 12 digit Aadhaar number.`;

      this.kycService.showToast(toastHead, toastBody, {
        headerClasses: 'bg-danger text-white'
      });
    }
    //this.ngOnInit();
  }

  dismissAadharFrontModal(promoter?: promoterDetails) {
    // @ts-ignore
    this.deleteKycDoc(promoter?.aadharFrontDocId, this.Ac_Front, promoter).then(
      (r: any) => {
        console.log('PROMOTERS DATA AFTER DELETING DOCS ', this.promotersData);
      }
    );
    this.imgSrc = '';
    this.modalRef?.close();
    this.cdr.detectChanges();
  }

  // verifyAadhar(event: any, promoter?: promoterDetails) {
  //   // @ts-ignore
  //   promoter?.aadhar = event;
  //   console.log(event);
  //   console.log(promoter);
  //   this.closeAadharFrontModal(promoter);
  // }

  /**
   * AADHAR BACK CODE...
   */
  uploadAadharBackData(event: any, promoter?: promoterDetails) {
    console.log(event);
    // @ts-ignore
    this.helperCode(event, type.aadharBack, promoter);
    this.cdr.detectChanges();
  }

  closeAadharBackModal(promoter?: promoterDetails) {
    // @ts-ignore
    promoter?.aadharBackUploaded = true;
    this.imgSrc = '';
    this.modalRef?.close();
    this.cdr.detectChanges();
    this.checkForArrowColor();
    console.log(this.promotersData);
    //this.ngOnInit();
  }

  dismissAadharBackModal(promoter?: promoterDetails) {
    // @ts-ignore
    this.deleteKycDoc(promoter?.aadharBackDocId, this.Ac_Back, promoter).then(
      (r: any) => {
        console.log('PROMOTERS DATA AFTER DELETING DOCS ', this.promotersData);
      }
    );
    this.imgSrc = '';
    this.modalRef?.close();
    this.cdr.detectChanges();
  }

  closeModalOfAdd() {
    if (this.signatoryName) {
      if (this.userKycData.businessType === 'Company') {
        if (this.signatoryDin) {
          this.addPromoter();
          this.signatoryName = '';
          this.signatoryDin = '';
        }
      } else if (this.userKycData.businessType === 'PartnerShip') {
        if (this.signatoryDes) {
          this.addPromoter();
          this.signatoryName = '';
          this.signatoryDes = 'Partner';
        }
      } else {
        this.addPromoter();
        this.signatoryName = '';
      }
      this.checkForArrowColor();
    }
  }

  closeAddModal() {
    this.modalRef?.close();
  }

  addPromoter() {
    let promoter: promoterDetails = {
      aadhar: '',
      aadharBack: '',
      aadharBackImageName: '',
      aadharBackUploaded: false,
      aadharFront: '',
      aadharFrontImageName: '',
      aadharFrontUploaded: false,
      din: this.userKycData.businessType === 'Company' ? this.signatoryDin : '',
      name: this.signatoryName,
      pan: '',
      panFront: '',
      panImageName: '',
      panUploaded: false,
      panVerifiedAt: '',
      email: '',
      designation:
        this.userKycData.businessType === 'PartnerShip' ? this.signatoryDes : ''
    };
    this.promotersData.push(promoter);
    console.log(this.promotersData);
    this.cdr.detectChanges();
    this.modalRef?.close();
  }

  setPages(value: string) {
    console.log('SELECTED DROPDOWN VALUE ', value);
    this.signatoryDes = value;
    this.cdr.detectChanges();
  }

  addErrors(value: string) {
    let error = this.utilityService.emailIsInvalid(value);

    if (error) {
      this.emailErrorsList[value] = error;
    }

    this.cdr.detectChanges();
  }

  moveBack() {
    this.valueChange.emit('Bank Details');
  }

  moveFront() {
    if (this.allDocumentsUploaded) {
      let flag = false;
      let message: String = '';
      let promoter: promoterDetails = { name: '' } as promoterDetails;
      let promoters: any = [];
      for (let i = 0; i < this.promotersData.length; i++) {
        let it = this.promotersData[i];
        promoters.push({
          name: it.name || '',
          din: it.din || '',
          pan: it.pan || '',
          panVerified: it.panUploaded || false,
          panVerifiedAt: it.panVerifiedAt || '',
          panFront: it.panFront || '',
          panFrontName: it.panImageName || '',
          aadhaarNo: it.aadhar.toString() || '',
          aadhaarFront: it.aadharFront || '',
          aadhaarFrontName: it.aadharFrontImageName || '',
          aadhaarBack: it.aadharBack || '',
          aadhaarBackName: it.aadharBackImageName || '',
          designation: it.designation || '',
          email: it.email || ''
        });
        // if (
        //   !it.panUploaded ||
        //   !it.aadharFrontUploaded ||
        //   !it.aadharBackUploaded ||
        //   !it.email
        // ) {
        //   // if (!it.panUploaded) {
        //   //   message = 'Pan not Found';
        //   // }
        //   // if (!it.aadharFrontUploaded) {
        //   //   message = 'Aadhaar front not Found';
        //   // }
        //   // if (!it.aadharBackUploaded) {
        //   //   message = 'Aadhaar back not Found';
        //   // }
        //   // if (!it.email) {
        //   //   message = 'Email not Found';
        //   // }
        //   // flag = true;
        //   // promoter = it;
        // } else {
        //   // promoters.push({
        //   //   name: it.name,
        //   //   din: it.din,
        //   //   pan: it.pan,
        //   //   panVerified: it.panUploaded,
        //   //   panVerifiedAt: it.panVerifiedAt,
        //   //   panFront: it.panFront,
        //   //   panFrontName: it.panImageName,
        //   //   aadhaarNo: it.aadhar.toString(),
        //   //   aadhaarFront: it.aadharFront,
        //   //   aadhaarFrontName: it.aadharFrontImageName,
        //   //   aadhaarBack: it.aadharBack,
        //   //   aadhaarBackName: it.aadharBackImageName,
        //   //   designation: it.designation,
        //   //   email: it.email
        //   // });
        // }
      }
      if (flag) {
        let toastHead = 'Error';
        let toastBody = `${message} for ${promoter.name}.`;

        this.kycService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        return;
      }
      this.patchKycData(promoters, 'Documents');
      return;
    }

    // if (this.allDocumentsUploaded) {
    //
    // }
  }

  patchKycData(promoters: any, page: string) {
    let body = {
      promoters: promoters,
      page: 'Documents'
    };
    let params = {};
    //let url = environment.apiPrefix + `/kyclink/${this.crnId}`;
    this.errors = [];
    this.kycService.patchKycData(this.crnId, body, params).subscribe(
      (resp: any) => {
        console.log('DATA PATCHED ', resp);
        if (resp.success) {
          let kycData: kycDataModel = this.kycService.kycDataMapping(
            resp.result
          );
          kycData.documents = this.userKycData.documents;
          //this.updateValueFromKycData(this.userKycData);
          this.kycDataUpgrade.emit(kycData);
          this.valueChange.emit(page);
        } else {
          let toastHead = 'Error';
          let toastBody = 'Uploaded file is greater than 5 MB.';

          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          console.log('ERROR ', resp.errors);
        }
        this.cdr.detectChanges();
      },
      err => {
        let toastHead = 'Error';
        let toastBody = '';
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
          toastBody = 'Connection Error';
        } else {
          console.log(err.error.errors);
          this.errors.push(err.error.errors);
          toastBody = err.error.errors;
        }
        this.kycService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
      }
    );
  }

  async verifyPan(pan: string, promoter: promoterDetails) {
    this.isLoading = true;
    this.cdr.detectChanges();
    let params = {};
    let url = environment.apiPrefix + `/kyclink/pan/${pan}`;
    this.errors = [];
    await this.kycService.getPanData(url, params).subscribe(
      (resp: any) => {
        console.log('PAN RESPONSE ', resp);
        if (resp.success) {
          let promoterName = promoter.name
            .toLowerCase()
            .trim()
            .replace(/\s/g, '');
          let panInfo = resp.result.panDetails;
          let panName = `${panInfo.full_name}`
            .toLowerCase()
            .trim()
            .replace(/\s/g, '');
          // console.log(panName);
          // console.log(promoterName);
          if (promoterName === panName) {
            promoter.panUploaded = true;
            promoter.pan = panInfo.pan.toUpperCase();
            promoter.panVerifiedAt = new Date().toISOString();
            this.modalRef?.close();
            this.imgSrc = '';
            this.checkForArrowColor();
          } else {
            let toastHead = 'Error';
            let toastBody =
              'Name on PAN did not match with Registered Promoter Name.';

            this.kycService.showToast(toastHead, toastBody, {
              headerClasses: 'bg-danger text-white'
            });
          }
        } else {
          let toastHead = 'Error';
          let toastBody = resp.errors;

          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          console.log('ERROR ', resp.errors);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        let toastHead = 'Error';
        let toastBody = '';
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
          toastBody = 'Connection Error';
        } else {
          console.log(err.error.errors);
          toastBody = err.error.errors;
          this.errors.push(err.error.errors);
        }
        this.kycService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    );
  }

  postKycDocs(body: File, fieldName: string, promoter: promoterDetails) {
    const formData = new FormData();
    formData.append('file', body);
    let url =
      environment.apiPrefix + `/kyclink/${this.crnId}/upload/${fieldName}`;
    this.errors = [];
    this.kycService.postDocuments(url, formData).subscribe(
      (resp: any) => {
        console.log('RESPONSE FROM INDIVIDUAL DOCUMENTS ', resp);
        if (resp.success) {
          let hash = resp.result.hash;
          let fileName = resp.result.name;
          let docId = resp.result.documentId;
          //let trimName = fileName.length > 6 ? fileName.substring(0, 7) : fileName;
          if (resp.result.type === 'pan') {
            promoter.panImageName = fileName;
            promoter.panFront = hash;
            promoter.panDocId = docId;
          } else if (resp.result.type === 'Ac_Front') {
            promoter.aadharFrontImageName = fileName;
            promoter.aadharFront = hash;
            promoter.aadharFrontDocId = docId;
          } else {
            promoter.aadharBackImageName = fileName;
            promoter.aadharBack = hash;
            promoter.aadharBackDocId = docId;
          }
          let toastHead = 'Success';
          let toastBody = `${resp.result.type} document successfully Uploaded.`;
          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
          this.checkForArrowColor();
        } else {
          this.errors.push(resp.errors);
          console.log('ERROR ', resp.errors);
        }
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
        } else {
          console.log(err.error.errors);
          let toastHead = 'Document Error';
          let toastBody = err.error.errors;

          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.errors.push(err.error.errors);
        }
        this.cdr.detectChanges();
      }
    );
  }

  async deleteKycDoc(
    documentId: string,
    documentType: string,
    promoter: promoterDetails
  ) {
    this.errors = [];
    await this.kycService.deleteDocuments(this.crnId, documentId).subscribe(
      (resp: any) => {
        console.log('RESPONSE AFTER DELETING DOCUMENT ', resp);
        if (resp.success) {
          if (documentType === 'pan') {
            promoter.pan = '';
            promoter.panVerifiedAt = '';
            promoter.panUploaded = false;
            promoter.panImageName = '';
            promoter.panFront = '';
            promoter.panDocId = '';
          } else if (documentType === 'Ac_Front') {
            promoter.aadharFrontDocId = '';
            promoter.aadharFrontUploaded = false;
            promoter.aadharFrontImageName = '';
            promoter.aadharFront = '';
            promoter.aadhar = '';
          } else {
            promoter.aadharBack = '';
            promoter.aadharBackUploaded = false;
            promoter.aadharBackDocId = '';
            promoter.aadharBackImageName = '';
          }
        } else {
          this.errors.push(resp.errors);
          console.log('ERROR ', resp.errors);
        }
        //console.log("PROMOTERS DATA AFTER DELETING DOCS ",this.promotersData);
        this.cdr.detectChanges();
        this.checkForArrowColor();
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
        } else {
          console.log(err.error.errors);
          let toastHead = 'Document Error';
          let toastBody = err.error.errors;

          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.errors.push(err.error.errors);
        }
        this.cdr.detectChanges();
      }
    );
  }

  promoterEmailUpdate(event: any, promoter: promoterDetails) {
    promoter.email = event;
    console.log('PROMOTERS ', this.promotersData);
    this.cdr.detectChanges();
    this.checkForArrowColor();
  }

  checkForArrowColor() {
    let flag = false;
    let count = 0;
    for (let i = 0; i < this.promotersData.length; i++) {
      let it = this.promotersData[i];
      if (
        !it.panUploaded ||
        !it.aadharFrontUploaded ||
        !it.aadharBackUploaded ||
        !it.email
      ) {
        //count --;
      } else {
        count++;
      }
    }
    console.log('COUNT ', count);
    if (
      count >= 2 &&
      (this.userKycData.businessType === 'Company' ||
        this.userKycData.businessType === 'LLP')
    ) {
      flag = true;
    } else if (
      count >= 1 &&
      !(
        this.userKycData.businessType === 'Company' ||
        this.userKycData.businessType === 'LLP'
      )
    ) {
      flag = true;
    }
    this.allDocumentsUploaded = flag;
    console.log('ALL DOCS UPLOADED ', this.allDocumentsUploaded);
    this.cdr.detectChanges();
  }
}

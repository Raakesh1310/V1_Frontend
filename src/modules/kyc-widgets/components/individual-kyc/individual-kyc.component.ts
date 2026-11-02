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
import { environment } from '../../../../environments/environment';
import { KycWidgetsService } from '@modules/kyc-widgets/services';

enum type {
  pan,
  aadharFront,
  aadharBack
}

@Component({
  selector: 'sbpro-individual-kyc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './individual-kyc.component.pug',
  styleUrls: ['./individual-kyc.component.scss']
})
export class IndividualKycComponent implements OnInit {
  @ViewChild('warningMessage', { static: true }) warningMessage?: ElementRef;
  @Output() valueChange = new EventEmitter();
  @Output() kycProcessDone = new EventEmitter();
  @Output() kycDataUpgrade = new EventEmitter();
  @Input() userKycData!: kycDataModel;
  @Input() crnId = '';
  @ViewChild('parentElement') chip!: ElementRef;
  @ViewChild('anPan') anPan!: ElementRef;
  @ViewChild('anAcFront') anAcFront!: ElementRef;
  @ViewChild('anAcBack') anAcBack!: ElementRef;
  @ViewChild('video') video!: ElementRef;
  @ViewChild('canvas') canvas!: ElementRef;
  selectedDoc = type;
  panVerified = false;
  panImageName = '';
  panVerifiedAt = '';
  userSelfie = '';

  six = 6;
  seven = 7;

  panImageDocId = '';
  aadhaarBackDocId = '';
  aadhaarFrontDocId = '';
  userCoordinates = { latitude: '', longitude: '' };
  userPan = '';
  userName = '';
  userAadhar = '';
  aadharFrontImageName = '';
  aadharBackImageName = '';
  aadharFrontVerified = false;
  aadharBackVerified = false;
  allDocsVerified = false;
  imgSrc: any = '';
  errors: string[] = [];
  notDeletable = false;
  isLoading = false;
  apiStartUrl = environment.apiHost;
  digioRequestId = '';
  digioTokenId = '';
  mobileNo = '';
  private modalRef?: NgbModalRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private kycService: KycWidgetsService
  ) { }

  ngOnInit(): void {
    console.log('DATA ON INDIVIDUAL KYC ', this.userKycData);
    this.notDeletable = this.userKycData.promoters.length > 0;
    this.updateValueFromKycData(this.userKycData);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        //console.log(position.coords);
        this.userCoordinates.latitude = position.coords.latitude.toString();
        this.userCoordinates.longitude = position.coords.longitude.toString();
        console.log(position.coords);
      });
    }
  }

  // ngAfterViewInit(): void {
  //   console.log('VIDEO ', this.video);
  //   navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  //     console.log("STREAM ",stream);
  //     this.video.nativeElement.srcObject = stream;
  //     this.video.nativeElement.play();
  //   });
  // }

  updateValueFromKycData(data: kycDataModel) {
    if (data) {
      let userData = data.promoters[0];
      if (userData) {
        this.panVerified = userData.panUploaded;
        this.panVerifiedAt = userData.panVerifiedAt;
        this.userName = userData.name;
        this.userPan = userData.pan;
        this.userAadhar = userData.aadhar;
        this.panImageDocId = userData.panFront;
        this.panImageName =
          userData.panImageName.length > this.six
            ? userData.panImageName.substring(0, this.seven)
            : userData.panImageName;
        this.aadhaarBackDocId = userData.aadharBack;
        this.aadharBackImageName =
          userData.aadharBackImageName.length > this.six
            ? userData.aadharBackImageName.substring(0, this.seven)
            : userData.aadharBackImageName;
        this.aadharBackVerified = userData.aadharBackUploaded;
        this.aadhaarFrontDocId = userData.aadharFront;
        this.aadharFrontImageName =
          userData.aadharFrontImageName.length > this.six
            ? userData.aadharFrontImageName.substring(0, this.seven)
            : userData.aadharFrontImageName;
        this.aadharFrontVerified = userData.aadharFrontUploaded;
        if (data.digioRequestId === '' || data.digioTokenId === '') {
          this.generateUniqueId(data.mobile.toString(), this.userName);
        } else {
          if (data.digioTokenTimeStamp) {
            // checking if present timeStamp is greater then saved one...
            if (new Date().getTime() > data.digioTokenTimeStamp) {
              this.regenerateToken(data.digioRequestId);
            }
          }
          this.digioTokenId = data.digioTokenId;
          this.digioRequestId = data.digioRequestId;
          this.mobileNo = data.mobile.toString();
        }
      } else {
        this.generateUniqueId(data.mobile.toString(), data.name);
      }
      this.allDocsVerified = this.panVerified;
      // if (this.aadharFrontImageName && this.aadharBackImageName && this.panImageName) {
      //   this.allDocsVerified = true;
      // }
    }
    this.cdr.detectChanges();
  }

  openModal(alertDialog: any, event: any) {
    if (!this.userCoordinates.latitude || !this.userCoordinates.longitude) {
      this.openWarningModal();
      return;
    }
    console.log(event);
    this.modalRef = this.modalService.open(alertDialog, {
      backdrop: 'static',
      centered: true,
      size: 'md'
    });
  }

  captureImage(img: string) {
    console.log(img);
    this.userSelfie = img;
    this.dismissModal();
    this.cdr.detectChanges();
  }

  startDigilocker() {
    if (!this.userCoordinates.latitude || !this.userCoordinates.longitude) {
      this.openWarningModal();
      return;
    }
    if (this.userSelfie === '') {
      let toastHead = 'Error';
      let toastBody = 'Upload Selfie First';
      this.kycService.showToast(toastHead, toastBody, {
        headerClasses: 'bg-danger text-white'
      });
      return;
    }
    if (!this.digioRequestId || !this.digioTokenId || !this.mobileNo) {
      let toastHead = 'Error';
      let toastBody = 'Digilocker Request Id not found';
      this.kycService.showToast(toastHead, toastBody, {
        headerClasses: 'bg-danger text-white'
      });
      return;
    }
    let options = {
      environment: 'production',
      callback: (response: any) => {
        console.log(response);
        if (response.hasOwnProperty('error_code')) {
          return console.log('error occurred in process');
        }
        this.kycRequestStatus(this.digioRequestId);
      },
      is_iframe: false,
      logo: 'https://myescrow.castler.com/assets/img/Castler_logo.png',
      theme: {
        primaryColor: '#AB3498',
        secondaryColor: '#000000'
      }
    };
    // @ts-ignore
    let digio = new Digio(options);
    digio.init();
    digio.submit(this.digioRequestId, this.mobileNo, this.digioTokenId);
  }

  uploadData(event: any, doc?: type) {
    let fileName = '';
    let file: any;
    const reader = new FileReader();
    if (doc === type.pan) {
      if (event.target) {
        fileName = 'pan'; // getting image name....
        file = event.target.files[0];
      } else {
        fileName = 'pan'; // getting image name....
        file = event;
      }
    } else if (doc === type.aadharFront) {
      if (event.target) {
        fileName = 'Ac_Front'; // getting image name....
        file = event.target.files[0];
      } else {
        fileName = 'Ac_Front'; // getting image name....
        file = event;
      }
    } else {
      if (event.target) {
        fileName = 'Ac_Back'; // getting image name....
        file = event.target.files[0];
      } else {
        fileName = 'Ac_Back'; // getting image name....
        file = event;
      }
    }
    reader.onload = e => (this.imgSrc = reader.result);
    reader.readAsDataURL(file);
    console.log(this.imgSrc);
    this.postKycDocs(file, fileName);
    //this.cdr.detectChanges();
  }

  closeModal(event?: any, doc?: type) {
    console.log(event);
    if (doc === type.pan) {
      this.userName = this.userKycData.name || '';
      if (!this.userName) {
        let toastHead = 'Error';
        let toastBody = `Name Field is Empty`;
        this.kycService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
      } else {
        this.verifyPan(event[1]).then(r => r);
      }
      return;
    } else if (doc === type.aadharFront) {
      if (!event) {
        let toastHead = 'Error';
        let toastBody = `Aadhaar Number is Empty`;
        this.kycService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
      } else {
        this.aadharFrontVerified = true;
        this.userAadhar = event;
        this.imgSrc = '';
        this.modalRef?.close();
      }
    } else {
      this.aadharBackVerified = true;
      this.imgSrc = '';
      this.modalRef?.close();
    }
    if (
      this.aadharFrontVerified &&
      this.panVerified &&
      this.aadharBackVerified
    ) {
      this.allDocsVerified = true;
    }
    this.cdr.detectChanges();
  }

  dismissModal() {
    this.modalRef?.close();
    this.imgSrc = '';
  }

  closeChip(doc?: type) {
    if (doc === type.pan) {
      this.deleteKycDoc(this.panImageDocId, 'pan').then(r => r);
    } else if (doc === type.aadharFront) {
      this.deleteKycDoc(this.aadhaarFrontDocId, 'Ac_Front').then(r => r);
    } else {
      this.deleteKycDoc(this.aadhaarBackDocId, 'Ac_Back').then(r => r);
    }
    this.cdr.detectChanges();
  }

  // moveBack() {
  //   this.valueChange.emit('Business Details');
  // }

  openWarningModal() {
    this.modalRef = this.modalService.open(this.warningMessage, {
      backdrop: 'static'
    });
    this.modalRef.result.then(resp => {
      this.modalRef?.close();
    });
  }

  moveFront() {
    if (
      this.userCoordinates.latitude === '' &&
      this.userCoordinates.longitude === ''
    ) {
      this.openWarningModal();
      return;
    }

    if (this.allDocsVerified) {
      this.patchKycData();
      // this.patchKycData(obj);
    }
  }

  // verifyPan() {
  //   this.patchKycData({'businessPan' : this.userPan});
  // }

  patchKycData() {
    let params = {};
    let obj = {
      name: this.userName,
      din: '',
      pan: this.userPan,
      panVerified: this.panVerified,
      panVerifiedAt: this.panVerifiedAt,
      panFront: this.panImageDocId,
      panFrontName: this.panImageName,
      aadhaarNo: this.userAadhar.toString(),
      aadhaarFront: this.aadhaarFrontDocId,
      aadhaarFrontName: this.aadharFrontImageName,
      aadhaarBack: this.aadhaarBackDocId,
      aadhaarBackName: this.aadharBackImageName,
      designation: ''
    };
    let data = {
      page: 'Bank Details',
      promoters: [obj],
      latitude: this.userCoordinates.latitude || '',
      longitude: this.userCoordinates.longitude || ''
    };
    //let url = environment.apiPrefix + `/kyclink/${this.crnId}`;
    this.errors = [];
    this.kycService.patchKycData(this.crnId, data, params).subscribe(
      (resp: any) => {
        console.log('DATA PATCHED ON INDIVIDUAL KYC ', resp);
        if (resp.success) {
          let kycData: kycDataModel = this.kycService.kycDataMapping(
            resp.result
          );
          kycData.documents = this.userKycData.documents;
          this.updateValueFromKycData(kycData);
          this.kycDataUpgrade.emit(kycData);
          this.valueChange.emit('Bank Details');
        } else {
          // this.isLoading = false;
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
          let toastHead = 'Verification Error';
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

  postKycDocs(body: File, fieldName: string) {
    const formData = new FormData();
    formData.append('file', body);
    let url =
      environment.apiPrefix + `/kyclink/${this.crnId}/upload/${fieldName}`;
    this.errors = [];
    this.kycService.postDocuments(url, formData).subscribe(
      (resp: any) => {
        console.log('RESPONSE FROM INDIVIDUAL DOCUMENTS ', resp);
        if (resp.success) {
          let fileName = resp.result.name;
          let trimName =
            fileName.length > 6 ? fileName.substring(0, 7) : fileName;
          let docId = resp.result.hash;
          if (resp.result.type === 'pan') {
            this.panImageName = trimName;
            this.panImageDocId = docId;
          } else if (resp.result.type === 'Ac_Front') {
            this.aadharFrontImageName = trimName;
            // this.aadharFrontVerified = true;
            this.aadhaarFrontDocId = docId;
          } else {
            this.aadharBackImageName = trimName;
            // this.aadharBackVerified = true;
            this.aadhaarBackDocId = docId;
          }

          let toastHead = 'Success';
          let toastBody = `${resp.result.type} document successfully Uploaded.`;
          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
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

  async deleteKycDoc(documentId: string, documentType: string) {
    this.errors = [];
    await this.kycService.deleteDocuments(this.crnId, documentId).subscribe(
      (resp: any) => {
        console.log('RESPONSE AFTER DELETING DOCUMENT ', resp);
        if (resp.success) {
          if (documentType === 'pan') {
            this.panVerified = false;
            this.panImageName = '';
            this.userPan = '';
          } else if (documentType === 'Ac_Front') {
            this.aadharFrontVerified = false;
            this.aadharFrontImageName = '';
            this.userAadhar = '';
          } else {
            this.aadharBackVerified = false;
            this.aadharBackImageName = '';
          }
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

  async verifyPan(pan: string) {
    this.isLoading = true;
    this.cdr.detectChanges();
    let params = {};
    let url = environment.apiPrefix + `/kyclink/pan/${pan}`;
    this.errors = [];
    await this.kycService.getPanData(url, params).subscribe(
      (resp: any) => {
        console.log('PAN RESPONSE ', resp);
        try {
          if (resp.success) {
            let promoterName = this.userName
              .toLowerCase()
              .trim()
              .replace(/\s/g, '');
            let pan = resp.result.panDetails;
            let panName = `${pan.full_name}`
              .toLowerCase()
              .trim()
              .replace(/\s/g, '');
            if (promoterName === panName) {
              this.panVerified = true;
              this.userPan = pan.pan.toUpperCase();
              this.panVerifiedAt = new Date().toISOString();
              this.modalRef?.close();
              this.imgSrc = '';
            } else {
              let toastHead = 'Error';
              let toastBody = 'Name on PAN did not match with Registered Promoter Name.';

              this.kycService.showToast(toastHead, toastBody, {
                headerClasses: 'bg-danger text-white'
              });
            }
            this.isLoading = false;
          } else {
            let toastHead = 'Error';
            let toastBody = resp.errors;

            this.kycService.showToast(toastHead, toastBody, {
              headerClasses: 'bg-danger text-white'
            });
            console.log('ERROR ', resp.errors);
          }
        } catch (error) {
          let toastHead = 'Error';
          let toastBody = 'Could Not Update PAN Details';

          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          console.log('ERROR ', resp.errors);
        } finally {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
        } else {
          console.log(err.error.errors);
          let toastHead = 'Error';
          let toastBody = err.error.errors;

          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.errors.push(err.error.errors);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    );
  }

  download(type: string) {
    if (type === 'pan') {
      this.anPan.nativeElement.click();
    } else if (type === 'Ac_Front') {
      this.anAcFront.nativeElement.click();
    } else {
      this.anAcBack.nativeElement.click();
    }
  }

  generateUniqueId(mobile: string, customerName: string) {
    let body: any = {
      customer_identifier: mobile,
      customer_name: customerName,
      template_name: 'DIGILOCKER',
      notify_customer: false,
      request_details: {},
      generate_access_token: true
    };
    this.kycService.digioRequestGeneration(body, this.crnId).subscribe(
      (resp: any) => {
        console.log('RESPONSE FROM DIGIO ', resp);
        if (resp.success) {
          this.digioRequestId = resp.result.id;
          this.digioTokenId = resp.result.access_token.id;
          this.mobileNo = mobile;
        }
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM DIGIO SIDE ', err);
        this.cdr.detectChanges();
      }
    );
  }

  regenerateToken(id: string) {
    let body: any = {
      entity_id: id
    };
    this.kycService.digioTokenRegeneration(body, this.crnId).subscribe(
      (resp: any) => {
        console.log('RESPONSE FROM DIGIO AFTER TOKEN REGENERATION ', resp);
        if (resp.success) {
          this.digioTokenId = resp.result.response.id;
        }
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM DIGIO SIDE ', err);
        this.cdr.detectChanges();
      }
    );
  }

  kycRequestStatus(requestId: string) {
    this.kycService.digioRequestStatus(requestId, this.crnId).subscribe(
      (resp: any) => {
        console.log('RESPONSE FROM DIGIO OF REQUEST STATUS ', resp);
        if (resp.success) {
          console.log('SIGNING COMPLETED SUCCESSFULLY');
          this.allDocsVerified = true;
          this.userPan = resp.result.actions[0].details.pan.id_number;
          this.userAadhar = resp.result.actions[0].details.aadhaar.id_number;
          this.panVerified = true;
          //this.digioTokenId = resp.result.response.id;
        }
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM DIGIO SIDE ', err);
        this.cdr.detectChanges();
      }
    );
  }
}

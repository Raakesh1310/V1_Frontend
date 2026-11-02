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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from '@common/services';
import { kycDataModel } from '@modules/kyc-widgets/models';
import { KycWidgetsService } from '@modules/kyc-widgets/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sbpro-bank-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bank-details.component.pug',
  styleUrls: ['./bank-details.component.scss']
})
export class BankDetailsComponent implements OnInit {
  @Output() valueChange = new EventEmitter();
  @Output() kycProcessDone = new EventEmitter();
  @Output() kycDataUpgrade = new EventEmitter();
  @Input() kycType = '';
  @Input() userKycData!: kycDataModel;
  @ViewChild('inputFile') inputFile!: ElementRef;
  @ViewChild('parentElement') chip!: ElementRef;
  // url = '';
  chequeFile!: File;
  dataFromChequeOCR = false;
  cancelledChequeName = '';
  chequeDocId = '';
  cancelledChequeVerify = false;
  bankForm!: FormGroup;
  errors: string[] = [];
  imgSrc: string | ArrayBuffer | null = '';
  isLoading = false;
  notEdit = false;
  showAccountHolderName = false;
  showVerifyButton = false;
  showChequeIcon = false;
  url = '';
  @Input() crnId = '';
  private modalRef?: NgbModalRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private kycService: KycWidgetsService,
    private utilityService: UtilityService
  ) {
    this.bankForm = this.formBuilder.group({
      bankAccNumber: [0, [Validators.required]],
      ifsc: ['', [Validators.required]],
      bankName: ['', [Validators.required]],
      accountHolderName: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    console.log('BANK DETAILS DATA ', this.userKycData);
    this.notEdit = this.userKycData.bankVerified;
    this.updateValueFromKycData(this.userKycData);
  }

  updateValueFromKycData(data: kycDataModel) {
    this.cancelledChequeVerify = data.bankVerified;
    this.bankForm.controls['bankAccNumber'].setValue(data.bankAccNumber);
    this.bankForm.controls['ifsc'].setValue(data.ifsc);
    this.bankForm.controls['bankName'].setValue(data.bankName);
    this.bankForm.controls['accountHolderName'].setValue(
      data.accountHolderName
    );
    // this will mark all input fields as read only and preventing details filling,
    // verify button from opening
    this.dataFromChequeOCR = data.bankVerified;
    this.showVerifyButton = true;
    if (data.accountHolderName) {
      this.showAccountHolderName = true;
      this.showVerifyButton = false;
    }
    for (let i = 0; i < data.documents.length; i++) {
      if (data.documents[i].type === 'cheque') {
        this.cancelledChequeName = data.documents[i].name;
        this.chequeDocId = data.documents[i].hash;
        break;
      }
    }
    // TODO: this is not working
    //if (this.notEdit) {
    this.url = environment.apiPrefix + '/kyc/download-file/' + this.chequeDocId;
    console.log(this.url);
    //}
    this.cdr.detectChanges();
  }

  downloadFile($event: Event, docHash: string) {
    this.utilityService.downloadFile($event, docHash, this.chequeDocId);
  }
  openModal(alertDialog: any, event: any) {
    //console.log(event);
    this.modalRef = this.modalService.open(alertDialog, {
      backdrop: 'static',
      centered: true
    });
  }

  uploadData(event: any) {
    let flag = false;
    let fileType = '';
    if (event.target) {
      let file = event.target.files[0];
      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        console.log(event.target.files[0]);
        let fileName = event.target.files[0].name; // getting image name....
        this.cancelledChequeName =
          fileName.length > 5 ? fileName.substring(0, 5) : fileName;
        const reader = new FileReader();
        reader.onload = e => (this.imgSrc = reader.result);
        reader.readAsDataURL(event.target.files[0]); // setting img Src value, therefore it is affecting document side...
        this.chequeFile = event.target.files[0];
        console.log(this.imgSrc);
      } else {
        flag = true;
        fileType = file.type;
      }
    } else {
      if (event.type === 'image/png' || event.type === 'image/jpeg') {
        let fileName = event.name; // getting image name....
        this.cancelledChequeName =
          fileName.length > 5 ? fileName.substring(0, 5) : fileName;
        const reader = new FileReader();
        reader.onload = e => (this.imgSrc = reader.result);
        reader.readAsDataURL(event); // setting img Src value, therefore it is affecting document side...
        //this.postKycDocs(event, 'cheque');
        this.chequeFile = event;
        console.log(this.imgSrc);
      } else {
        flag = true;
        fileType = event.type;
      }
    }
    if (flag) {
      let toastHead = 'Document Error';
      let toastBody = `${fileType} not allowed, supported formats are jpg, jpeg or png.`;
      this.kycService.showToast(toastHead, toastBody, {
        headerClasses: 'bg-danger text-white'
      });
      return;
    }
    this.cdr.detectChanges();
  }

  closeModal() {
    this.postKycDocs(this.chequeFile, 'cheque');
    // this.cancelledChequeVerify = true;
    // this.modalRef?.close();
    this.cdr.detectChanges();
  }

  dismissModal() {
    this.modalRef?.close();
    this.imgSrc = '';
  }

  closeChip() {
    this.deleteKycDoc(this.chequeDocId, 'cheque').then(r => r);
  }

  download() {
    if (this.notEdit) {
      console.log('Downloading doc...');
      //this.reportDownloadLink$.next(url);
      this.kycService.docsDownload(this.chequeDocId).subscribe(resp => {
        console.log('DOCUMENT DOWNLOADED', resp);
      });
    }
  }

  moveBack() {
    //if (this.cancelledChequeVerify) {
    if (this.kycType === 'Individual') {
      this.valueChange.emit('KYC Details');
    } else {
      this.valueChange.emit('Business KYC');
    }
    //}
  }

  moveFront() {
    if (this.cancelledChequeVerify) {
      if (this.kycType === 'Individual') {
        //this.valueChange.emit('Individual KYC');
        this.kycProcessDone.emit(true);
      } else {
        this.valueChange.emit('Signatory KYC');
        // this.patchKycData(this.bankForm.value, 'Signatory KYC');
      }
    }
  }

  verifyChequeNumber() {
    this.cancelledChequeVerify = true;
    this.cdr.detectChanges();
  }

  // verifyBankDetails() {
  //   console.log(this.bankForm.value);
  //   this.patchKycData(this.bankForm.value, 'Signatory KYC');
  // }

  patchKycData() {
    if (this.cancelledChequeVerify) {
      let params = {};
      // let url = environment.apiPrefix + `/kyclink/${this.crnId}`;
      this.errors = [];
      let body = {
        ifsc: this.bankForm.controls['ifsc'].value.toString(),
        bankAccNumber: this.bankForm.controls['bankAccNumber'].value.toString(),
        bankName: this.bankForm.controls['bankName'].value.toString(),
        accountHolderName: this.bankForm.controls[
          'accountHolderName'
        ].value.toString()
      };
      this.kycService.patchKycData(this.crnId, body, params).subscribe(
        (resp: any) => {
          console.log('DATA PATCHED ON BANK DETAILS ', resp);
          if (resp.success) {
            let kycData: kycDataModel = this.kycService.kycDataMapping(
              resp.result
            );
            kycData.documents = this.userKycData.documents;
            this.kycDataUpgrade.emit(kycData);
            this.updateValueFromKycData(kycData);
            //this.valueChange.emit(page);
          } else {
            // this.isLoading = false;
            this.errors.push(resp.errors);
            console.log('ERROR ', resp.errors);
          }
          this.moveFront();
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
  }

  postKycDocs(body: File, fieldName: string) {
    this.isLoading = true;
    this.cdr.detectChanges();
    const formData = new FormData();
    formData.append('file', body);
    let url =
      environment.apiPrefix + `/kyclink/${this.crnId}/upload/${fieldName}`;
    this.errors = [];
    this.kycService.postDocuments(url, formData).subscribe(
      (resp: any) => {
        console.log('RESPONSE FROM INDIVIDUAL DOCUMENTS ', resp);
        if (resp.success) {
          let kycData: kycDataModel = this.kycService.kycDataMapping(
            resp.result.updatedKyc
          );
          kycData.documents = this.userKycData.documents;
          this.updateValueFromKycData(kycData);
          this.kycDataUpgrade.emit(kycData);
          this.modalRef?.close();
          let hash = resp.result.entry.hash;
          let fileName = resp.result.entry.name;
          this.chequeDocId = resp.result.entry.documentId;
          this.showChequeIcon = true;
          console.log(this.chequeDocId);
          if (!resp.result.updatedKyc.bankVerified) {
            this.showChequeIcon = false;
            // this will mark all input fields as edit
            this.dataFromChequeOCR = false;
            this.cancelledChequeVerify = true;
          }
          let toastHead = 'Success';
          let toastBody = `${resp.result.type ||
            ''} document successfully Uploaded.`;
          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
        } else {
          this.errors.push(resp.errors);
          let toastHead = 'Error';
          let toastBody = resp.errors;
          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.modalRef?.close();
          this.showChequeIcon = false;
          // this will mark all input fields as edit
          this.dataFromChequeOCR = false;
          this.cancelledChequeVerify = true;
          console.log('ERROR ', resp.errors);
        }
        this.showVerifyButton = true;
        this.isLoading = false;
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
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    );
  }

  async deleteKycDoc(documentId: string, documentType: string) {
    // let url = environment.apiPrefix + `/kyclink/${this.crnId}/${documentId}`;
    this.errors = [];
    await this.kycService.deleteDocuments(this.crnId, documentId).subscribe(
      (resp: any) => {
        console.log('RESPONSE AFTER DELETING DOCUMENT ', resp);
        if (resp.success) {
          this.showChequeIcon = false;
          this.chequeDocId = '';
          this.cancelledChequeVerify = false;
          this.dataFromChequeOCR = false;
          this.chip.nativeElement.style.display = 'none';
          this.imgSrc = '';
          let kycData: kycDataModel = this.kycService.kycDataMapping(
            resp.result[1]
          );
          kycData.documents = this.userKycData.documents;
          this.kycDataUpgrade.emit(kycData);
          this.bankForm.reset();
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

  /**
   * Verifying Account holders name
   * with ifsc and Account Number
   */
  verifyBankAccountHolder() {
    let body = {
      ifsc: this.bankForm.controls['ifsc'].value,
      bankAccountNumber: this.bankForm.controls['bankAccNumber'].value.replace(
        /[^\w\s]/gi,
        ''
      )
    };
    console.log(body);
    this.isLoading = true;
    this.cdr.detectChanges();
    let params = {};
    this.errors = [];
    this.kycService
      .verifyAccountHoldersName(this.crnId, body, params)
      .subscribe(
        (resp: any) => {
          console.log('DATA ON PENNY DROP ', resp);
          if (resp.success) {
            let result = resp.result;
            // this will mark all input fields as read only and preventing details filling,
            // verify button from opening
            this.dataFromChequeOCR = true;
            this.notEdit = true;
            this.bankForm.controls['accountHolderName'].setValue(
              result.accountHolderName
            );
            this.showAccountHolderName = true;
            this.showVerifyButton = false;
          } else {
            // this.isLoading = false;
            this.errors.push(resp.errors);
            console.log('ERROR ', resp.errors);
            let toastHead = 'Error';
            let toastBody = resp.errors;
            this.kycService.showToast(toastHead, toastBody, {
              headerClasses: 'bg-danger text-white'
            });
          }
          console.log('CHEQUE DOC ID ', this.chequeDocId);
          // if(this.chequeDocId) {
          //   this.showChequeIcon = true;
          // }else {
          //   this.showChequeIcon = false;
          // }
          this.isLoading = false;
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
          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      );
  }
}

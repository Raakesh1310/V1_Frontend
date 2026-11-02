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
import { Router } from '@angular/router';
import { UtilityService } from '@common/services';
import { kycDataModel, statuses } from '@modules/kyc-widgets/models';
import { KycWidgetsService } from '@modules/kyc-widgets/services';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sbpro-kyc-documents',
  templateUrl: './kyc-documents.component.pug',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./kyc-documents.component.scss']
})
export class KycDocumentsComponent implements OnInit {
  @Output() valueChange = new EventEmitter();
  @Output() kycProcessDone = new EventEmitter();
  @Input() userKycData!: kycDataModel;
  @Output() kycDataUpgrade = new EventEmitter();
  @Input() crnId = '';
  @Input() gstAvailable = true;
  @ViewChild('inputGst') inputGst!: ElementRef;
  @ViewChild('inputCoi') inputCoi!: ElementRef;
  @ViewChild('inputBr') inputBr!: ElementRef;
  @ViewChild('inputPan') inputPan!: ElementRef;
  @ViewChild('anGst') anGst!: ElementRef;
  @ViewChild('anCoi') anCoi!: ElementRef;
  @ViewChild('anBr') anBr!: ElementRef;
  @ViewChild('anPan') anPan!: ElementRef;
  imgSrc: string | ArrayBuffer | null = '';
  gstImageName = '';
  gstDocId = '';
  coiImageName = '';
  coiDocId = '';
  brImageName = '';
  brDocId = '';
  gstImageHash = '';
  coiImageHash = '';
  brImageHash = '';
  panImageName = '';
  panImageHash = '';
  panDocId = '';
  notEdit = false;
  apiStartUrl = environment.apiPrefix;
  moveToNextPage = false;
  errors: string[] = [];
  brText = '';
  downloadFileLink = '';
  sampleBr = '../../../../assets/sample-files/BR.docx';
  partnerShipLetter = '../../../../assets/sample-files/Partnership_Letter.docx';
  llpBr = '../../../../assets/sample-files/LLP_BR.docx';
  downloadFolderName = S3FolderName.KYC;

  constructor(
    private cdr: ChangeDetectorRef,
    private kycService: KycWidgetsService,
    private router: Router,
    private utilService: UtilityService
  ) {}

  ngOnInit(): void {
    console.log('DATA ON KYC DOCS ', this.userKycData);
    this.updateValueFromKycData(this.userKycData);
  }

  updateValueFromKycData(data: kycDataModel) {
    for (let i = 0; i < data.documents.length; i++) {
      let fileName = data.documents[i].name;
      let hash = data.documents[i].hash;
      let docId = data.documents[i].documentId;
      let trimName = fileName.length > 6 ? fileName.substring(0, 7) : fileName;
      if (data.documents[i].type === 'gst') {
        this.gstImageName = trimName;
        this.gstImageHash = hash;
        this.gstDocId = docId;
      }
      if (data.documents[i].type === 'coi') {
        this.coiImageName = trimName;
        this.coiImageHash = hash;
        this.coiDocId = docId;
      }
      if (data.documents[i].type === 'br') {
        this.brImageName = trimName;
        this.brImageHash = hash;
        this.brDocId = docId;
      }

      if (data.documents[i].type === 'companyPan') {
        this.panImageName = trimName;
        this.panImageHash = hash;
        this.panDocId = docId;
      }

      if (
        this.userKycData.businessType === 'Company' ||
        this.userKycData.businessType === 'LLP'
      ) {
        if (
          this.coiImageName &&
          this.gstImageName &&
          this.brImageName &&
          this.panImageName
        ) {
          this.notEdit = true;
          this.moveToNextPage = true;
          break;
        }
      } else if (this.userKycData.businessType === 'Sole Proprietor') {
        if (this.panImageName && this.gstImageName) {
          this.notEdit = true;
          this.moveToNextPage = true;
          break;
        }
      } else if (this.userKycData.businessType === 'PartnerShip') {
        if (this.panImageName && this.gstImageName && this.brImageName) {
          this.notEdit = true;
          this.moveToNextPage = true;
          break;
        }
      }
    }
    this.setDownloadFileLink();
    this.checkBeforeMoving();
    this.cdr.detectChanges();
  }

  selectGst() {
    if (!this.notEdit && this.gstImageName === '') {
      this.inputGst.nativeElement.click();
    } else if (this.notEdit) {
      this.anGst.nativeElement.click();
    }
  }

  selectCoi() {
    if (!this.notEdit && this.coiImageName === '') {
      this.inputCoi.nativeElement.click();
    } else if (this.notEdit) {
      this.anCoi.nativeElement.click();
    }
  }

  selectBr() {
    if (!this.notEdit && this.brImageName === '') {
      this.inputBr.nativeElement.click();
    } else if (this.notEdit) {
      this.anBr.nativeElement.click();
    }
  }

  selectPan() {
    if (!this.notEdit && this.panImageName === '') {
      this.inputPan.nativeElement.click();
    } else if (this.notEdit) {
      this.anPan.nativeElement.click();
    }
  }

  uploadData(event: any, num: number) {
    let field = '';
    if (num === 1) {
      field = 'gst';
    } else if (num === 2) {
      field = 'coi';
    } else if (num === 3) {
      field = 'companyPan';
    } else {
      field = 'br';
    }
    console.log(event.target.files.item(0).name);
    console.log(event);
    const reader = new FileReader();
    reader.onload = e => (this.imgSrc = reader.result);
    reader.readAsDataURL(event.target.files[0]); // to read the contents of the file or image
    this.postKycDocs(event.target.files[0], field);
  }

  moveBack() {
    this.valueChange.emit('Signatory KYC');
  }

  moveFront() {
    if (this.moveToNextPage) {
      let body = {
        status: statuses.Completed
      };
      let params = {};
      //let url = environment.apiPrefix + `/kyclink/${this.crnId}`;
      this.kycService.patchKycData(this.crnId, body, params).subscribe(
        (resp: any) => {
          console.log('DATA AFTER SUCCESSFUL KYC ', resp);
          if (resp.success) {
            let kycData: kycDataModel = this.kycService.kycDataMapping(
              resp.result
            );
            kycData.documents = this.userKycData.documents;
            this.router
              .navigate(['/kyc/success' + '/' + this.crnId])
              .then(r => r);
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
    } else {
      let toastHead = 'Document Upload Error';
      let toastBody = 'Please upload all the documents';
      this.utilService.showToast(toastHead, toastBody, {
        headerClasses: 'bg-danger text-white'
      });
      this.cdr.detectChanges();
    }
  }

  setDownloadFileLink() {
    if (this.userKycData.businessType === 'Company') {
      this.downloadFileLink = this.sampleBr;
      this.brText = 'Board Resolution';
    } else if (this.userKycData.businessType === 'PartnerShip') {
      this.downloadFileLink = this.partnerShipLetter;
      this.brText = 'Partnership letter';
    } else if (this.userKycData.businessType === 'LLP') {
      this.downloadFileLink = this.llpBr;
      this.brText = 'LLP resolution';
    } else {
      this.downloadFileLink = '';
    }
  }

  postKycDocs(body: File, fieldName: string) {
    const formData = new FormData();
    formData.append('file', body);
    let url =
      environment.apiPrefix + `/kyclink/${this.crnId}/upload/${fieldName}`;
    this.errors = [];
    this.kycService.postDocuments(url, formData).subscribe(
      (resp: any) => {
        console.log('RESPONSE FROM DOCUMENTS ', resp);
        if (resp.success) {
          let fileName = resp.result.name;
          let docId = resp.result.documentId;
          let trimName =
            fileName.length > 6 ? fileName.substring(0, 7) : fileName;
          if (resp.result.type === 'gst') {
            this.gstImageName = trimName;
            this.gstDocId = docId;
          } else if (resp.result.type === 'coi') {
            this.coiImageName = trimName;
            this.coiDocId = docId;
          } else if (resp.result.type === 'br') {
            this.brImageName = trimName;
            this.brDocId = docId;
          } else {
            this.panImageName = trimName;
            this.panDocId = docId;
          }

          this.checkBeforeMoving();

          let toastHead = 'Success';
          let toastBody = `${resp.result.type} document successfully Uploaded.`;
          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
          // this.userKycData = this.kycService.kycDataMapping(resp.result);
          // this.kycDataUpgrade.emit(this.userKycData);
          // this.updateValueFromKycData(this.userKycData);
          //this.valueChange.emit(page);
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

  coiCheck(): boolean {
    return !(
      this.userKycData.businessType === 'Sole Proprietor' ||
      this.userKycData.businessType === 'PartnerShip'
    );
  }

  panCheck(): boolean {
    return !(this.userKycData.businessType === 'Company');
  }

  checkBeforeMoving() {
    let flag = false;
    if (
      this.userKycData.businessType === 'Company' ||
      this.userKycData.businessType === 'LLP'
    ) {
      if (this.gstAvailable) {
        if (
          this.coiImageName !== '' &&
          this.brImageName !== '' &&
          this.panImageName !== '' &&
          this.gstImageName !== ''
        ) {
          flag = true;
        }
      } else {
        if (
          this.coiImageName !== '' &&
          this.brImageName !== '' &&
          this.panImageName !== ''
        ) {
          flag = true;
        }
      }
    } else if (this.userKycData.businessType === 'Sole Proprietor') {
      if (this.gstAvailable) {
        if (this.panImageName !== '' && this.gstImageName !== '') {
          flag = true;
        }
      } else {
        if (this.panImageName !== '') {
          flag = true;
        }
      }
    } else if (this.userKycData.businessType === 'PartnerShip') {
      if (this.gstAvailable) {
        if (
          this.panImageName !== '' &&
          this.brImageName !== '' &&
          this.gstImageName !== ''
        ) {
          flag = true;
        }
      } else {
        if (this.panImageName !== '' && this.brImageName !== '') {
          flag = true;
        }
      }
    }
    this.notEdit = flag;
    this.moveToNextPage = flag;
  }

  deleteDocs(documentType: string, documentId: string) {
    this.errors = [];
    this.kycService.deleteDocuments(this.crnId, documentId).subscribe(
      (resp: any) => {
        console.log('RESPONSE AFTER DELETING DOCUMENT ', resp);
        if (resp.success) {
          if (documentType === 'gst') {
            this.gstImageHash = '';
            this.gstImageName = '';
          } else if (documentType === 'coi') {
            this.coiImageName = '';
            this.coiImageHash = '';
          } else if (documentType === 'pan') {
            this.panImageName = '';
            this.panImageHash = '';
          } else {
            this.brImageName = '';
            this.brImageHash = '';
          }
        } else {
          this.errors.push(resp.errors);
          console.log('ERROR ', resp.errors);
        }
        this.checkBeforeMoving();
        console.log('PROMOTERS DATA AFTER DELETING DOCS ', this.gstImageName);
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
}

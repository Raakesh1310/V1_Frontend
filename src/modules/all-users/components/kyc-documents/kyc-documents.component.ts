import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from '@common/services';
import { AllUsersService } from '@modules/all-users/services';
import { AuthService } from '@modules/auth/services';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import { environment } from 'environments/environment';

@Component({
  selector: 'sbpro-kyc-documents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kyc-documents.component.pug',
  styleUrls: ['kyc-documents.component.scss']
})
export class KycDocumentsComponent implements OnInit {
  data: any = {};
  editOnly = false;
  errors: string[] = [];
  crnId = '';
  documents = [];
  @Input() panHash: string = '';
  @Input() panName: string = '';
  @Input() panDocId: string = '';
  @Input() coiHash: string = '';
  @Input() coiName: string = '';
  @Input() coiDocId: string = '';
  @Input() gstHash: string = '';
  @Input() gstName: string = '';
  @Input() gstDocId: string = '';
  @Input() brHash: string = '';
  @Input() brName: string = '';
  @Input() brDocId: string = '';
  @Input() businessType: string = '';
  @ViewChild('inputGst') inputGst!: ElementRef;
  @ViewChild('inputCoi') inputCoi!: ElementRef;
  @ViewChild('inputBr') inputBr!: ElementRef;
  @ViewChild('inputPan') inputPan!: ElementRef;
  gstDocs: Document[] = [];
  panDocs: Document[] = [];
  brDocs: Document[] = [];
  coiDocs: Document[] = [];
  dataLoaded = true;
  downloadFolderName = S3FolderName.KYC;

  constructor(
    private _location: Location,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private allUserService: AllUsersService,
    private utilityService: UtilityService
  ) {
    this.crnId = this.route.snapshot.params.id;
  }

  get isIndividual() {
    return this.authService.isIndividual();
  }

  ngOnInit() {
    this.allUserService
      .getSingleEntry(this.route.snapshot.params.id, {})
      .subscribe(
        (resp: any) => {
          console.log('RESPONSE 1', resp);
          if (resp.success) {
            this.data = resp.result;
            console.log('resp ==>>', resp);

            this.documents = resp.result.documents;
            for (let doc of resp.result.documents) {
              if (doc.type === 'gst') {
                // this.gstHash = doc.hash;
                // this.gstName = doc.name;
                // this.gstDocId = doc.documentId;
                this.gstDocs.push(doc);
              }

              if (doc.type === 'coi') {
                // this.coiHash = doc.hash;
                // this.coiName = doc.name;
                // this.coiDocId = doc.documentId;
                this.coiDocs.push(doc);
              }

              if (doc.type === 'pan') {
                // this.panHash = doc.hash;
                // this.panName = doc.name;
                // this.panDocId = doc.documentId;
                this.panDocs.push(doc);
              }

              if (doc.type === 'companyPan') {
                // this.companyPanHash = doc.hash;
                // this.companyPanName = doc.name;
                // this.companyPanDocId = doc.documentId;
                this.panDocs.push(doc);
              }

              if (doc.type === 'br') {
                // this.brHash = doc.hash;
                // this.brName = doc.name;
                // this.brDocId = doc.documentId;
                this.brDocs.push(doc);
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
  }

  goBack() {
    this._location.back();
  }

  downloadFile($event: Event, docHash: string, docName?: string) {
    this.utilityService.downloadFile(
      $event,
      docHash,
      this.downloadFolderName,
      docName
    );
  }
  // /**
  // * Re.
  // */
  //
  // panRequired() {
  //   return this.businessType !== 'Sole Proprietor';
  // }
  //
  // coiRequired() {
  //   return ['LLP', 'Company'].includes(this.businessType) && !this.isIndividual;
  // }
  //
  // brRequired() {
  //   return this.businessType === 'Company';
  // }

  /**
   * Opening selection box for different documents.
   */
  selectGst() {
    this.inputGst.nativeElement.click();
  }

  selectCoi() {
    this.inputCoi.nativeElement.click();
  }

  selectBr() {
    this.inputBr.nativeElement.click();
  }

  selectPan() {
    this.inputPan.nativeElement.click();
  }

  /**
   * Setting document field.
   */
  uploadData(event: any, num: number) {
    let field = '';
    switch (num) {
      case 1: {
        field = 'companyPan';
        break;
      }
      case 2: {
        field = 'gst';
        break;
      }
      case 3: {
        field = 'coi';
        break;
      }
      default: {
        field = 'br';
        break;
      }
    }
    console.log(event.target.files.item(0));
    this.postKycDocs(event.target.files[0], field);
  }

  /**
   * Updating values on database.
   */
  postKycDocs(body: File, fieldName: string) {
    const formData = new FormData();
    formData.append('file', body);
    let url =
      environment.apiPrefix + `/kyclink/${this.crnId}/upload/${fieldName}`;
    this.errors = [];
    this.allUserService.postDocuments(url, formData).subscribe(
      (resp: any) => {
        console.log('RESPONSE FROM DOCUMENTS ', resp);
        if (resp.success) {
          let fileName = resp.result.name;
          let docId = resp.result.documentId;
          let hash = resp.result.hash;
          let trimName =
            fileName.length > 6 ? fileName.substring(0, 7) : fileName;
          switch (resp.result.type.toString()) {
            case 'gst': {
              this.gstName = trimName;
              this.gstDocId = docId;
              this.gstHash = hash;
              this.gstDocs.push(resp.result);
              break;
            }
            case 'coi': {
              this.coiName = trimName;
              this.coiDocId = docId;
              this.coiHash = hash;
              this.coiDocs.push(resp.result);
              break;
            }
            case 'br': {
              this.brName = trimName;
              this.brDocId = docId;
              this.brHash = hash;
              this.brDocs.push(resp.result);
              break;
            }
            case 'pan': {
              this.panName = trimName;
              this.panDocId = docId;
              this.panHash = hash;
              this.panDocs.push(resp.result);
              break;
            }
          }
          let toastHead = 'Success';
          let toastBody = `${resp.result.type} document successfully Uploaded.`;
          this.allUserService.showToast(toastHead, toastBody, {
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

          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.errors.push(err.error.errors);
        }
        this.cdr.detectChanges();
      }
    );
  }

  /**
   * Deleting docs from database.
   */
  deleteDocs(documentId: string, num: number) {
    this.errors = [];
    this.allUserService.deleteDocuments(this.crnId, documentId).subscribe(
      (resp: any) => {
        console.log('RESPONSE AFTER DELETING DOCUMENT ', resp);
        if (resp.success) {
          switch (num) {
            case 1: {
              this.panHash = '';
              break;
            }
            case 2: {
              this.gstHash = '';
              break;
            }
            case 3: {
              this.coiHash = '';
              break;
            }
            default: {
              this.brHash = '';
              break;
            }
          }
          let toastHead = 'Success';
          let toastBody = `Document successfully Uploaded.`;
          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
        } else {
          this.errors.push(resp.errors);
          console.log('ERROR ', resp.errors);
          let toastHead = 'Error';
          let toastBody = resp.errors;
          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-dander text-white'
          });
        }
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        let toastHead = 'Document Error';
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
        this.allUserService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
      }
    );
  }

  public toIST(dateStr: string) {
    return this.utilityService
      .parseByTimeZone(dateStr, 'Asia/Kolkata')
      .format('MMM DD, YYYY, hh:mm:ss A');
  }
}

import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from '@common/services';
import { AllUsersService } from '@modules/all-users/services';
import { AuthService } from '@modules/auth/services';
import { KycDocuments, promoterDetails } from '@modules/kyc-widgets/models';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import { environment } from 'environments/environment';

enum type {
  pan,
  aadharFront,
  aadharBack
}

@Component({
  selector: 'sbpro-kyc-signatory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kyc-signatory.component.pug',
  styleUrls: ['kyc-signatory.component.scss']
})
export class KycSignatoryComponent implements OnInit {
  data: any = {};
  promoters: promoterDetails[] = [];
  selectedIndex = 0;
  errors: string[] = [];
  docType = type;
  crnId = '';
  pan = 'pan';
  businessType = '';
  availableForEdit = false;
  Ac_Front = 'Ac_Front';
  Ac_Back = 'Ac_Back';
  downloadFolderName = S3FolderName.KYC;
  @ViewChild('inputFilePan') inputFilePan!: ElementRef;
  @ViewChild('inputFileAadhaarFront') inputFileAadhaarFront!: ElementRef;
  @ViewChild('inputFileAadhaarBack') inputFileAadhaarBack!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private allUserService: AllUsersService,
    private utilityService: UtilityService
  ) {}

  ngOnInit() {
    console.log('Routing data ' + this.route.snapshot.params.id);
    console.log(this.authService.getBearerToken());
    this.crnId = this.route.snapshot.params.id;
    // let url =
    //   environment.apiPrefix +
    //   `/super-admin/kyclink/${this.route.snapshot.params.id}`;
    this.allUserService
      .getSingleEntry(this.route.snapshot.params.id, {})
      .subscribe(
        (resp: any) => {
          console.log('RESPONSE 1', resp);
          if (resp.success) {
            this.businessType = resp.result.businessType;
            // let arr: promoterDetails[] = [];
            //let data: kycDataModel;
            resp.result.promoters.forEach((it: any) => {
              this.promoters.push({
                aadhar: it.aadhaarNo,
                aadharBackImageName: it.aadhaarBackName,
                aadharBackUploaded: it.aadhaarNo !== '',
                aadharFrontImageName: it.aadhaarFrontName,
                aadharFrontUploaded: it.aadhaarNo !== '',
                aadharVerifiedAt: '',
                din: it.din,
                name: it.name,
                pan: it.pan,
                panImageName: it.panFrontName,
                panUploaded: it.panVerified,
                panVerifiedAt: it.panVerifiedAt,
                aadhaarVerified: false,
                aadharBack: it.aadhaarBack,
                aadharFront: it.aadhaarFront,
                panFront: it.panFront,
                designation: it.designation,
                edit: false,
                panLoading: false,
                aadhaarLoading: false
              });
            });
            // resp.result.documents.forEach((it : KycDocuments) =>  {
            //
            // });
            this.data = resp.result;
            // this.promoters = resp.result.promoters;
            console.log(this.promoters);
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
          this.cdr.detectChanges();
        }
      );
  }

  /**
   * Download urls for different documents.
   */
  async downloadFile($event: Event, docHash: string, docName?: string) {
    this.utilityService.downloadFile(
      $event,
      docHash,
      this.downloadFolderName,
      docName
    );
  }

  /**
   * Opening selection box for different docs.
   */
  openPanSelectionBox(index: number) {
    this.selectedIndex = index;
    this.inputFilePan.nativeElement.click();
    this.cdr.detectChanges();
  }

  openAadhaarFrontSelectionBox(index: number) {
    this.selectedIndex = index;
    this.inputFileAadhaarFront.nativeElement.click();
    this.cdr.detectChanges();
  }

  openAadhaarBackSelectionBox(index: number) {
    this.selectedIndex = index;
    this.inputFileAadhaarBack.nativeElement.click();
    this.cdr.detectChanges();
  }

  /**
   * Verifying Aadhaar credentials.
   */
  verifyAadhaar(aadhaar: string, promoter: promoterDetails) {
    console.log(aadhaar.toString().length);
    promoter.aadhaarLoading = true;
    this.cdr.detectChanges();
    if (aadhaar.toString().length === 12) {
      setTimeout(() => {
        promoter.aadhaarLoading = false;
        // @ts-ignore
        promoter?.aadharFrontUploaded = true;
        // @ts-ignore
        promoter?.aadhar = aadhaar;
        let toastHead = 'Success';
        let toastBody = `Aadhaar number ${aadhaar} successfully updated.`;
        this.allUserService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-success text-white'
        });
        this.cdr.detectChanges();
      }, 2000);
    } else {
      promoter.aadhaarLoading = false;
      let toastHead = 'Error';
      let toastBody = `Aadhaar number is not of 12 digits.`;

      this.allUserService.showToast(toastHead, toastBody, {
        headerClasses: 'bg-danger text-white'
      });
      this.cdr.detectChanges();
    }
  }

  /**
   * Verifying Pan credentials.
   */
  async verifyPan(pan: string, promoter: promoterDetails) {
    promoter.panLoading = true;
    this.cdr.detectChanges();
    let params = {};
    let url = environment.apiPrefix + `/kyclink/pan/${pan}`;
    this.errors = [];
    await this.allUserService.getPanData(url, params).subscribe(
      (resp: any) => {
        console.log('PAN RESPONSE ', resp);
        if (resp.success) {
          let promoterName = promoter.name
            .toLowerCase()
            .trim()
            .replace(/\s/g, '');
          let pan = resp.result.panDetails.data.result;
          let panName = `${pan.firstName.value}${pan.middleName?.value}${pan.lastName.value}`
            .toLowerCase()
            .trim()
            .replace(/\s/g, '');
          if (promoterName === panName) {
            promoter.panUploaded = true;
            promoter.pan = pan.panNumber.value.toUpperCase();
            promoter.panVerifiedAt = new Date().toISOString();
            let toastHead = 'Success';
            let toastBody = `Pan number ${pan.panNumber.value.toUpperCase()} successfully updated.`;

            this.allUserService.showToast(toastHead, toastBody, {
              headerClasses: 'bg-success text-white'
            });
          } else {
            let toastHead = 'Error';
            let toastBody =
              'Name on PAN did not match with Registered Promoter Name.';

            this.allUserService.showToast(toastHead, toastBody, {
              headerClasses: 'bg-danger text-white'
            });
          }
        } else {
          let toastHead = 'Error';
          let toastBody = resp.errors;

          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          console.log('ERROR ', resp.errors);
        }
        promoter.panLoading = false;
        this.cdr.detectChanges();
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

          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.errors.push(err.error.errors);
        }
        promoter.panLoading = false;
        this.cdr.detectChanges();
      }
    );
  }

  /**
   * Checking document type and updating value Accordingly.
   */
  helperCode(event: any, doc: type, promoter: promoterDetails) {
    // console.log(index+1);
    promoter = this.promoters[this.selectedIndex];
    console.log(this.promoters[this.selectedIndex]);
    if (event.target?.files) {
      let file: File = event.target.files[0];
      if (doc === type.pan) {
        this.postKycDocs(file, this.pan, promoter);
        // console.log(this.imgSrc);
      } else if (doc === type.aadharFront) {
        this.postKycDocs(file, this.Ac_Front, promoter);
      } else {
        this.postKycDocs(file, this.Ac_Back, promoter);
      }
    }
  }

  /**
   * Setting documents on kyc.
   */
  postKycDocs(body: File, fieldName: string, promoter: promoterDetails) {
    console.log(promoter);
    const formData = new FormData();
    formData.append('file', body);
    let url =
      environment.apiPrefix + `/kyclink/${this.crnId}/upload/${fieldName}`;
    this.errors = [];
    this.allUserService.postDocuments(url, formData).subscribe(
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
          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
        } else {
          this.errors.push(resp.errors);
          console.log('ERROR ', resp.errors);
        }
        console.log('PROMOTERS AFTER UPDATION ', this.promoters);
        console.log('UPDATED PROMOTER ', promoter);
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
   * Deleting kyc docs from database.
   */
  async deleteKycDoc(
    documentHash: string,
    documentType: string,
    promoter: promoterDetails
  ) {
    this.errors = [];
    let list: KycDocuments = this.data.documents.find(
      (ele: KycDocuments, index: number) => {
        if (ele.hash === documentHash) {
          return ele;
        }
      }
    );
    console.log('ELEMENTS ', list);
    if (list) {
      await this.allUserService
        .deleteDocuments(this.crnId, list.documentId)
        .subscribe(
          (resp: any) => {
            console.log('RESPONSE AFTER DELETING DOCUMENT ', resp);
            if (resp.success) {
              if (documentType === 'pan') {
                promoter.panImageName = '';
                promoter.panFront = '';
                promoter.panDocId = '';
              } else if (documentType === 'Ac_Front') {
                promoter.aadharFrontDocId = '';
                promoter.aadharFrontImageName = '';
                promoter.aadharFront = '';
              } else {
                promoter.aadharBack = '';
                promoter.aadharBackDocId = '';
                promoter.aadharBackImageName = '';
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

              this.allUserService.showToast(toastHead, toastBody, {
                headerClasses: 'bg-danger text-white'
              });
              this.errors.push(err.error.errors);
            }
            this.cdr.detectChanges();
          }
        );
    } else {
      let toastHead = 'Document Error';
      let toastBody = 'Document hash not found.';

      this.allUserService.showToast(toastHead, toastBody, {
        headerClasses: 'bg-danger text-white'
      });
    }
  }

  /**
   * Updating promoters fields.
   */
  patchKycData() {
    console.log(this.promoters);
    let promoters: any = [];
    for (let i = 0; i < this.promoters.length; i++) {
      let it = this.promoters[i];
      promoters.push({
        name: it.name,
        din: it.din,
        pan: it.pan,
        panVerified: it.panUploaded,
        panVerifiedAt: it.panVerifiedAt,
        panFront: it.panFront,
        panFrontName: it.panImageName,
        aadhaarNo: it.aadhar.toString(),
        aadhaarFront: it.aadharFront,
        aadhaarFrontName: it.aadharFrontImageName,
        aadhaarBack: it.aadharBack,
        aadhaarBackName: it.aadharBackImageName,
        designation: it.designation
      });
    }
    let body = {
      promoters: promoters,
      businessType: this.businessType
    };
    let params = {};
    this.errors = [];
    this.allUserService.patchKycData(this.crnId, body, params).subscribe(
      (resp: any) => {
        console.log('DATA PATCHED ', resp);
        if (resp.success) {
          let toastHead = 'Success';
          let toastBody = `${this.promoters.length} promoters Successfully Updated.`;
          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
          this.availableForEdit = false;
          this.promoters.forEach(it => {
            if (it.edit) {
              it.edit = !it.edit;
            }
          });
        } else {
          let toastHead = 'Error';
          let toastBody = resp.errors;
          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          console.log('ERROR ', resp.errors);
        }
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
          this.errors.push(err.error.errors);
          toastBody = err.error.errors;
        }
        this.allUserService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
      }
    );
  }

  /**
   * Checking if any promoter is in edit phase.
   */
  checkForEdit() {
    this.availableForEdit = this.promoters.some(it => {
      return it.edit;
    });
    this.cdr.detectChanges();
  }
}

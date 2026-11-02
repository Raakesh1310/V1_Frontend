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
  selector: 'sbpro-kyc-bank-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kyc-bank-details.component.pug',
  styleUrls: ['kyc-bank-details.component.scss']
})
export class KycBankDetailsComponent implements OnInit {
  data: any = {};
  @Input() accountHolderName = '';
  @Input() bankAccNumber = '';
  @Input() ifsc = '';
  @Input() bankName = '';
  @Input() bankVerified = '';
  @Input() bankVerifiedAt = '';
  @Input() chequeName = '';
  @Input() chequeHash = '';
  @ViewChild('inputFile') inputFile!: ElementRef;
  @Input() isSuperAdmin = false;
  params = {};
  editOnly = false;
  errors: string[] = [];
  crnId = '';
  isLoading = false;
  cancelledChequeName = '';
  chequeDocId = '';
  isChequePresent = false;
  downloadFolderName = S3FolderName.KYC;

  constructor(
    private _location: Location,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private allUserService: AllUsersService,
    private utilityService: UtilityService
  ) {}

  ngOnInit() {
    this.crnId = this.route.snapshot.params.id;
    console.log('Routing data ' + this.route.snapshot.params.id);
    console.log(this.authService.getBearerToken());
    // let url =
    //   environment.apiPrefix +
    //   `/super-admin/kyclink/${this.route.snapshot.params.id}`;
    this.allUserService
      .getSingleEntry(this.route.snapshot.params.id, this.params)
      .subscribe(
        (resp: any) => {
          console.log('RESPONSE 1', resp);
          if (resp.success) {
            this.data = resp.result;
            let data = resp.result;
            for (let i = 0; i < data.documents.length; i++) {
              if (data.documents[i].type === 'cheque') {
                this.cancelledChequeName = data.documents[i].name;
                this.chequeDocId = data.documents[i].documentId;
                this.chequeHash = data.documents[i].hash;
                this.isChequePresent = true;
                break;
              }
            }
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

  goBack() {
    this._location.back();
  }

  downloadCheque($event: Event) {
    this.utilityService.downloadFile(
      $event,
      this.chequeHash,
      this.downloadFolderName,
      this?.chequeName
    );
  }

  /**
   * Opens box for file selection.
   */
  openSelectionBox() {
    this.inputFile.nativeElement.click();
  }

  /**
   * Function for check Upload.
   */
  uploadCheque(event: any) {
    if (!event.target) {
      return;
    }
    this.isLoading = true;
    this.cdr.detectChanges();
    console.log(event.target.files[0]);
    const formData = new FormData();
    formData.append('file', event.target.files[0]);
    let url = environment.apiPrefix + `/kyclink/${this.crnId}/upload/cheque`;
    this.errors = [];
    this.allUserService.postDocuments(url, formData).subscribe(
      (resp: any) => {
        console.log('RESPONSE FROM INDIVIDUAL DOCUMENTS ', resp);
        if (resp.success) {
          let toastHead = 'Success';
          let toastBody = `${resp.result.type ||
            ''} document successfully Uploaded.`;
          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
          this.isChequePresent = true;
        } else {
          let toastHead = 'Error';
          let toastBody = resp.errors || 'Error while updating cheque';
          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.errors.push(resp.errors);
          this.isChequePresent = false;
          console.log('ERROR ', resp.errors);
        }
        this.editOnly = false;
        this.isLoading = false;
        this.isChequePresent = true;
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
        this.editOnly = false;
        this.isChequePresent = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    );
  }

  /**
   * Function to delete Check.
   */
  deleteCheque() {
    this.errors = [];
    this.allUserService.deleteDocuments(this.crnId, this.chequeDocId).subscribe(
      (resp: any) => {
        console.log('RESPONSE AFTER DELETING DOCUMENT ', resp);
        if (resp.success) {
          this.isChequePresent = false;
          let toastHead = 'Success';
          let toastBody = 'Successfully Deleted Document';
          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
        } else {
          let toastHead = 'Error';
          let toastBody = 'resp.errors';
          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.errors.push(resp.errors);
          console.log('ERROR ', resp.errors);
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
          this.allUserService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.errors.push(err.error.errors);
        }
        this.cdr.detectChanges();
      }
    );
  }

  getDate(s: string): string {
    let date = new Date(s);
    return `${date.getDate()}/${date.getMonth() +
      1}/${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`;
  }
}

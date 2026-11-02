import { Location } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services/toast.service';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { AuthService } from '@modules/auth/services';
import { ProfileService } from '@modules/profile/services';
import { UtilityService } from '@common/services';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import businessTypes from '../../../../config/businessTypes';

@Component({
  selector: 'sbpro-profile-document',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-document.component.pug',
  styleUrls: ['profile-document.component.scss']
})
export class ProfileDocumentComponent implements OnInit {
  // @Input() private _allDocumentsUploaded = false;
  @Input() public readOnly = false;
  @Input() public businessType = '';
  @Input() merchantId: string | null = null;
  @Output() public emitAllDocumentsUploaded: EventEmitter<
    boolean
  > = new EventEmitter();
  fileToUpload: any = null;
  document = '';
  docBusinessGst = false;
  docBusinessPan = false;
  docCancelledCheque = false;
  docBusinessLogo = false;
  docAuthorizedPersonPan = false;
  docCOI = false;
  docBR = false;
  docCA = false;
  errors: any = [];
  gstFile = '';
  panFile = '';
  cheqFile = '';
  logoFile = '';
  authpanFile = '';
  coiFile = '';
  brFile = '';
  caFile = '';
  profile!: MerchantProfile;
  toastHead = '';
  toastBody = '';
  progress = 101;
  gstFileProgress = false;
  panFileProgress = false;
  cheqFileProgress = false;
  logoFileProgress = false;
  authpanFileProgress = false;
  coiFileProgress = false;
  brFileProgress = false;
  caFileProgress = false;
  verified = false;
  deletingFile = '';
  downloadFolderName = S3FolderName.PROFILE;
  otherFileIndex!: number[];
  otherFiles = [];
  maxOtherDoc: number = 4;
  addIndexDoc: boolean = true;

  // profileInstance!: MerchantProfile;

  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private authService: AuthService,
    private _location: Location,
    private utilityService: UtilityService
  ) {
    this.verified = this.authService.isMerchantVerified();
  }

  ngOnInit() {
    this.otherFiles = [];
    this.otherFileIndex = [];
    this.profileService.getDocs(this.merchantId).subscribe(resp => {
      this.checkForFormComplete(resp.result);
      this.profile = resp.result;
      this.gstFile = resp.result.docBusinessGstOriginal;
      this.panFile = resp.result.docBusinessPanOriginal;
      this.cheqFile = resp.result.docCancelledChequeOriginal;
      this.logoFile = resp.result.docBusinessLogoOriginal;
      this.authpanFile = resp.result.docAuthorizedPersonPanOriginal;
      this.coiFile = resp.result.docCOIOriginal;
      this.brFile = resp.result.docBROriginal;
      this.caFile = resp.result.docCAOriginal;
      this.otherFiles = resp.result.docOther ? resp.result.docOther : [];
      this.mapOtherDocuments(this.otherFiles);
      this.cdr.detectChanges();
    });
  }

  mapOtherDocuments(otherFiles: any) {
    if (this.otherFiles === undefined || this.otherFiles.length === 0) {
      this.otherFileIndex.length = 1;
    } else if (this.otherFileIndex.length || this.otherFileIndex.length != 0) {
      this.otherFileIndex.length = 0;
      //   this.otherFileIndex.length - otherFiles.length;
      this.addIndexDoc =
        this.otherFiles.length > this.maxOtherDoc ? false : true;
    } else {
      this.addIndexDoc =
        this.otherFiles.length > this.maxOtherDoc ? false : true;
    }
    this.cdr.detectChanges();
  }

  checkForFormComplete(object: MerchantProfile) {
    let allDocsUploaded = this.isIndividual
      ? object.docAuthorizedPersonPan !== undefined &&
        object.docAuthorizedPersonPan.length > 0
      : object.docBusinessGst !== undefined &&
        object.docBusinessGst.length > 0 &&
        object.docAuthorizedPersonPan !== undefined &&
        object.docAuthorizedPersonPan.length > 0 &&
        object.docBusinessLogo !== undefined &&
        object.docBusinessLogo.length > 0 &&
        object.docCancelledCheque !== undefined &&
        object.docCancelledCheque.length > 0;

    if (this.panRequired()) {
      allDocsUploaded = this.isIndividual
        ? allDocsUploaded && true
        : allDocsUploaded &&
          object.docBusinessPan !== undefined &&
          object.docBusinessPan.length > 0;
    }

    if (this.coiRequired()) {
      allDocsUploaded = this.isIndividual
        ? allDocsUploaded && true
        : allDocsUploaded &&
          object.docCOI !== undefined &&
          object.docCOI.length > 0;
    }

    if (allDocsUploaded) {
      this.emitAllDocumentsUploaded.emit(true);
    }
  }

  downloadGst($event: Event) {
    this.utilityService.downloadFile(
      $event,
      this.profile.docBusinessGst,
      this.downloadFolderName,
      this.gstFile
    );
  }

  downloadPan($event: Event) {
    this.utilityService.downloadFile(
      $event,
      this.profile.docBusinessPan,
      this.downloadFolderName,
      this.panFile
    );
  }

  downloadCheq($event: Event) {
    this.utilityService.downloadFile(
      $event,
      this.profile.docCancelledCheque,
      this.downloadFolderName,
      this.cheqFile
    );
  }

  downloadLogo($event: Event) {
    this.utilityService.downloadFile(
      $event,
      this.profile.docBusinessLogo,
      this.downloadFolderName,
      this.logoFile
    );
  }

  downloadAuthPan($event: Event) {
    this.utilityService.downloadFile(
      $event,
      this.profile.docAuthorizedPersonPan,
      this.downloadFolderName,
      this.authpanFile
    );
  }

  downloadCOI($event: Event) {
    this.utilityService.downloadFile(
      $event,
      this.profile.docCOI,
      this.downloadFolderName,
      this.coiFile
    );
  }

  downloadBR($event: Event) {
    this.utilityService.downloadFile(
      $event,
      this.profile.docBR,
      this.downloadFolderName,
      this.brFile
    );
  }

  downloadCA($event: Event) {
    this.utilityService.downloadFile(
      $event,
      this.profile.docCA,
      this.downloadFolderName,
      this.caFile
    );
  }

  downloadOtherDoc($event: Event, otherFile: any) {
    this.utilityService.downloadFile(
      $event,
      otherFile.docOtherName,
      this.downloadFolderName,
      otherFile.docOtherOriginal
    );
  }

  deleteDocOthers(otherFile: any) {
    let fileName = 'docOther,' + otherFile.docOtherOriginal;
    this.removeFile(fileName);
    console.log(fileName);
  }

  removeFile(fileName: string) {
    this.deletingFile = fileName;
    this.profileService
      .deleteFile(this.merchantId, this.deletingFile)
      .subscribe(
        (resp: any) => {
          if (resp.success) {
            if (fileName === 'docBusinessGst') {
              this.gstFile = '';
            }
            if (fileName === 'docBusinessPan') {
              this.panFile = '';
            }
            if (fileName === 'docCancelledCheque') {
              this.cheqFile = '';
            }
            if (fileName === 'docBusinessLogo') {
              this.logoFile = '';
            }
            if (fileName === 'docAuthorizedPersonPan') {
              this.authpanFile = '';
            }
            if (fileName === 'docCOI') {
              this.coiFile = '';
            }

            if (fileName === 'docBR') {
              this.brFile = '';
            }
            if (fileName === 'docCA') {
              this.caFile = '';
            }

            if (fileName.split(',')[0] === 'docOther') {
              console.log(this.otherFiles);
              let index = this.otherFiles.findIndex(
                (file: any) => file.docOtherOriginal === fileName.split(',')[1]
              );
              this.otherFiles.splice(index, 1);
              this.mapOtherDocuments(this.otherFiles);
            }

            this.deletingFile = '';

            this.emitAllDocumentsUploaded.emit(false);

            this.cdr.detectChanges();
          } else {
            console.log(resp);
            console.log(`failed to delete ${fileName} file`);
          }
        },
        err => {
          this.deletingFile = '';
          console.log(err.error.errors);
          this.errors = err.error.errors;
          this.cdr.detectChanges();
        }
      );
  }

  handleFileInput(
    event: any,
    toastHeader: ToastMessageData,
    toastBody: ToastMessageData
  ) {
    this.fileToUpload = event.target.files.item(0);
    this.document = event.target.id;
    var allowedExentsion = /(\.jpg|\.pdf|\.jpeg|\.png|\.doc|\.docx)$/i;
    if (
      this.document === 'docCA' &&
      !allowedExentsion.exec(this.fileToUpload.name)
    ) {
      this.errors = ['Invalid File. Please try again'];
      return;
    } else {
      this.errors = [];
    }
    this.calltoService(event.target.id, event.target.files.item(0));
  }

  async onSubmit(toastHeader: ToastMessageData, toastBody: ToastMessageData) {
    this.calltoService(this.document, this.fileToUpload);
  }

  async calltoService(document: string, file: File) {
    this.profileService
      .uploadFile(this.merchantId, document, file)
      .subscribe((resp: any) => {
        console.log(resp);
        if (resp.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round((100 * resp.loaded) / resp.total);
          if (percentDone > 0 || percentDone < 100) {
            switch (document) {
              case 'docBusinessGst':
                this.gstFileProgress = true;
                break;
              case 'docBusinessPan':
                this.panFileProgress = true;
                break;
              case 'docCancelledCheque':
                this.cheqFileProgress = true;
                break;
              case 'docBusinessLogo':
                this.logoFileProgress = true;
                break;
              case 'docAuthorizedPersonPan':
                this.authpanFileProgress = true;
                break;
              case 'docCOI':
                this.coiFileProgress = true;
                break;
              case 'docBR':
                this.brFileProgress = true;
                break;
              case 'docCA':
                this.caFileProgress = true;
            }
            console.log(document);
            this.progress = percentDone;
          } else {
            this.progress = 101;
          }
        }
        if (resp.type === HttpEventType.Response) {
          console.log('Upload complete');
          if (!resp.body.success) {
            this.toastBody = 'Something went wrong. Please try again.';
            this.toastHead = 'Failed';
            this.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-danger text-white'
            });
          } else {
            switch (document) {
              case 'docBusinessGst':
                this.gstFile = this.fileToUpload.name;
                this.profile.docBusinessGst = resp.body.result.docBusinessGst;
                this.toastHead = 'Business GST';
                this.gstFileProgress = false;
                break;
              case 'docBusinessPan':
                this.panFile = this.fileToUpload.name;
                this.profile.docBusinessPan = resp.body.result.docBusinessPan;
                this.toastHead = 'Business PAN';
                this.panFileProgress = false;

                break;
              case 'docCancelledCheque':
                this.cheqFile = this.fileToUpload.name;
                this.profile.docCancelledCheque =
                  resp.body.result.docCancelledCheque;
                this.toastHead = 'Cancelled cheque';
                this.cheqFileProgress = false;

                break;
              case 'docBusinessLogo':
                this.logoFile = this.fileToUpload.name;
                this.profile.docBusinessLogo = resp.body.result.docBusinessLogo;
                this.toastHead = this.isIndividual
                  ? 'Profile picture'
                  : 'Business Logo';
                this.logoFileProgress = false;

                break;
              case 'docAuthorizedPersonPan':
                this.authpanFile = this.fileToUpload.name;
                this.profile.docAuthorizedPersonPan =
                  resp.body.result.docAuthorizedPersonPan;
                this.toastHead = this.isIndividual ? 'PAN' : 'Authorized PAN';
                this.authpanFileProgress = false;

                break;
              case 'docCOI':
                this.coiFile = this.fileToUpload.name;
                this.profile.docCOI = resp.body.result.docCOI;
                this.toastHead = 'COI';
                this.coiFileProgress = false;

                break;

              case 'docBR':
                this.brFile = this.fileToUpload.name;
                this.profile.docBR = resp.body.result.docBR;
                this.toastHead = 'BR';
                this.coiFileProgress = false;

                break;

              case 'docCA':
                this.caFile = this.fileToUpload.name;
                this.profile.docCA = resp.body.result.docCA;
                this.toastHead = 'Commerical Agreement';
                this.caFileProgress = false;

                break;

              case 'docOther':
                this.otherFiles = resp.body.result.docOther;
                this.mapOtherDocuments(this.otherFiles);
            }
            this.toastBody = 'File uploaded successfully.';

            /**
             * Sent this event
             * to Event Emitter
             */
            this.checkForFormComplete(this.profile);
            this.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-success text-white'
            });
          }
        }
        this.cdr.detectChanges();
      });
  }

  next() {
    // this.checkForFormComplete();
    // this.cdr.detectChanges();
  }

  panRequired() {
    return this.businessType !== businessTypes.proprietorship;
  }

  coiRequired() {
    return (
      [
        businessTypes.company,
        businessTypes.llp,
        businessTypes.privateLimited,
        businessTypes.publicLimited
      ].includes(this.businessType) && !this.isIndividual
    );
  }

  get isIndividual() {
    return this.authService.isIndividual();
  }

  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 5000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }

  goBack() {
    this._location.back();
  }

  addFileInput() {
    if (this.otherFiles && this.otherFiles.length > 0) {
      if (
        this.otherFileIndex?.length <
        this.maxOtherDoc - this.otherFiles.length
      ) {
        this.otherFileIndex.push(1);
      } else if (
        this.otherFileIndex?.length ===
        this.maxOtherDoc - this.otherFiles.length
      ) {
        this.otherFileIndex.push(1);
        this.addIndexDoc = false;
      } else {
        this.addIndexDoc = false;
      }
    }

    if (this.otherFiles.length === 0) {
      if (this.otherFileIndex.length < this.maxOtherDoc) {
        this.otherFileIndex.push(1);
      } else if (this.otherFileIndex.length === this.maxOtherDoc) {
        this.otherFileIndex.push(1);
        this.addIndexDoc = false;
      } else {
        this.addIndexDoc = false;
      }
    }

    this.cdr.detectChanges();
  }
}

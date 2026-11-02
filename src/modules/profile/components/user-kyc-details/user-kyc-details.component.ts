import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { UserProfile } from '@modules/profile/models';
import { ProfileAdminService } from '@modules/profile/services/profileAdmin.service';
// import { User } from '@testing/mocks';
import { environment } from 'environments/environment';

@Component({
  selector: 'sbpro-user-kyc-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-kyc-details.component.pug',
  styleUrls: ['user-kyc-details.component.scss']
})
export class UserKycDetailsComponent implements OnInit {
  fileToUpload: any = null;
  document = '';
  docBusinessGst = false;
  docBusinessPan = false;
  docCancelledCheque = false;
  docAuthorizedPersonPan = false;
  errors: any = [];
  gstFile = '';
  panFile = '';
  cheqFile = '';
  logoFile = '';
  authpanFile = '';
  profile: any = {};

  constructor(
    private profileService: ProfileAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (history.state.profile) {
      this.profileService
        .getProfile(history.state.profile._id)
        .subscribe(resp => {
          console.log(resp);
          this.profile = resp.result;
          this.profile.email = history.state.profile.email;
          this.gstFile = resp.result.docBusinessGstOriginal;
          this.panFile = resp.result.docBusinessPanOriginal;
          this.cheqFile = resp.result.docCancelledChequeOriginal;
          this.logoFile = resp.result.docBusinessLogoOriginal;
          this.authpanFile = resp.result.docAuthorizedPersonPanOriginal;
          this.cdr.detectChanges();
        });
    }
  }

  downloadGst() {
    return environment.apiHost + '/uploads/docs/' + this.profile.docBusinessGst;
  }

  downloadPan() {
    return environment.apiHost + '/uploads/docs/' + this.profile.docBusinessPan;
  }

  downloadCheq() {
    return (
      environment.apiHost + '/uploads/docs/' + this.profile.docCancelledCheque
    );
  }

  downloadLogo() {
    return (
      environment.apiHost + '/uploads/logo/' + this.profile.docBusinessLogo
    );
  }

  downloadAuthPan() {
    return (
      environment.apiHost +
      '/uploads/docs/' +
      this.profile.docAuthorizedPersonPan
    );
  }

  removeGst() {
    this.gstFile = '';
  }

  removePan() {
    this.panFile = '';
  }

  removeCheq() {
    this.cheqFile = '';
  }

  removeLogo() {
    this.logoFile = '';
  }

  removeAuthpan() {
    this.authpanFile = '';
  }

  // tslint:disable-next-line:no-any
  handleFileInput(event: any) {
    this.calltoService(event.target.id, event.target.files.item(0));
    this.fileToUpload = event.target.files.item(0);
    this.document = event.target.id;
  }

  async onSubmit() {
    this.calltoService(this.document, this.fileToUpload);
  }

  async verifyDocument(_id: string, status: boolean) {
    await this.profileService
      .verifyDocument(this.profile._id, _id, status)
      // tslint:disable-next-line:no-any
      .subscribe((resp: any) => {});
  }

  // tslint:disable-next-line:no-any
  async verifyDoc(event: any) {
    this.verifyDocument(event.target.id, event.target.checked);
  }

  async calltoService(document: string, file: File) {
    await this.profileService
      .uploadService(this.profile._id, document, file)
      // tslint:disable-next-line:no-any
      .subscribe((resp: any) => {
        if (!resp.success) {
          // tslint:disable-next-line:no-any
          resp.errors.forEach((err: any) => this.errors.push(err));
        } else {
          switch (document) {
            case 'docBusinessGst':
              this.gstFile = this.fileToUpload.name;
              break;
            case 'docBusinessPan':
              this.panFile = this.fileToUpload.name;
              break;
            case 'docCancelledCheque':
              this.cheqFile = this.fileToUpload.name;
              break;
            case 'docBusinessLogo':
              this.logoFile = this.fileToUpload.name;
              break;
            case 'docAuthorizedPersonPan':
              this.authpanFile = this.fileToUpload.name;
              break;
          }
        }
        this.cdr.detectChanges();
      });
  }
}

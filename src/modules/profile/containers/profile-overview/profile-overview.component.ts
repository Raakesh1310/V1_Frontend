import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { ProfileService } from '@modules/profile/services';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import businessTypes from '../../../../config/businessTypes';

@Component({
  selector: 'sbpro-profile-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-overview.component.pug',
  styleUrls: ['profile-overview.component.scss']
})
export class ProfileOverviewComponent implements OnInit {
  isMerchantVerified: boolean;
  profileVerified = false;
  bankAccountVerified = false;
  // authorizedPersonPanVerified: boolean = false;
  allDocumentsUploaded = false;
  disabledTabs = [];
  readyToSubmit = false;
  businessType = '';
  private _loading$ = new BehaviorSubject(false);

  private _tabsUpdated$ = new Subject();

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {
    this.isMerchantVerified = this.authService.isMerchantVerified();
    this.profileService.getProfile(null, false).subscribe((resp: any) => {
      try {
        if (resp.success) {
          this.bankAccountVerified = resp.result.bankAccountVerified;
          this.profileVerified =
            resp.result.businessVerified &&
            resp.result.authorizedPersonPanVerified;
          this.businessType = resp.result.businessType;

          if (this.profileVerified) {
            this.disabledTabs = [];
          }

          const docs = resp.result.docs[0];

          if (!docs) {
            return;
          }

          let allDocsUploaded =
            docs.docBusinessGst !== undefined &&
            docs.docBusinessGst.length > 0 &&
            docs.docAuthorizedPersonPan !== undefined &&
            docs.docAuthorizedPersonPan.length > 0 &&
            docs.docBusinessLogo !== undefined &&
            docs.docBusinessLogo.length > 0 &&
            docs.docCancelledCheque !== undefined &&
            docs.docCancelledCheque.length > 0;

          if (this.panRequired()) {
            allDocsUploaded =
              allDocsUploaded &&
              docs.docBusinessPan !== undefined &&
              docs.docBusinessPan.length > 0;
          }

          if (this.panRequired()) {
            allDocsUploaded =
              allDocsUploaded &&
              docs.docCOI !== undefined &&
              docs.docCOI.length > 0;
          }

          if (allDocsUploaded) {
            this.allDocumentsUploaded = true;
          }
        }
      } catch (e) {
        console.error(e);
      }
      this.cdr.detectChanges();
    });
  }

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  ngOnInit() {
    /**
     * Handle Subject: tabsUpdated$
     */
    this._tabsUpdated$.subscribe(() => {
      if (
        this.profileVerified &&
        this.bankAccountVerified &&
        this.allDocumentsUploaded
      ) {
        this.readyToSubmit = true;
      } else {
        this.readyToSubmit = false;
      }
    });
  }

  onSubmit() {
    this.profileService.activate();
  }

  setProfileVerified(flag: boolean) {
    this.profileVerified = flag;
    this.disabledTabs = [];
    this._tabsUpdated$.next();
    this.cdr.detectChanges();
  }

  setAllDocumentsUploaded(flag: boolean) {
    this.allDocumentsUploaded = flag;
    this._tabsUpdated$.next();
    this.cdr.detectChanges();
  }

  setBankAccountVerified(flag: boolean) {
    this.bankAccountVerified = flag;
    this._tabsUpdated$.next();
    this.cdr.detectChanges();
  }

  setBusinessType(businessType: string) {
    this.businessType = businessType;
    this.cdr.detectChanges();
  }

  panRequired() {
    return this.businessType !== businessTypes.proprietorship;
  }

  coiRequired() {
    return [
      businessTypes.llp,
      businessTypes.privateLimited,
      businessTypes.publicLimited
    ].includes(this.businessType);
  }

  handleSubmission() {
    this._loading$.next(true);
    this.profileService.activate().subscribe(
      resp => {
        this._loading$.next(false);
        if (resp.success) {
          this.authService
            .logOut(
              true,
              'Your profile is successfully verified, Please login again'
            )
            .subscribe(
              () => {
                this._loading$.next(false);
              },
              () => {
                this._loading$.next(false);
              }
            );
        }
      },
      () => {
        this._loading$.next(false);
      }
    );
  }
}

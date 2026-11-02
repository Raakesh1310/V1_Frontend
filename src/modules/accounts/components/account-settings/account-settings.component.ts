import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilityService } from '@common/services';
import accountsStatus from '@modules/accounts/constants/accountsStatus';
import {
  Account,
  AccountInputAuthorizerInterface
} from '@modules/accounts/models';
import { AccountsAdminService } from '@modules/accounts/services';
import { ProfileService } from '@modules/profile/services';
import { environment } from 'environments/environment';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';

interface authorizer {
  name: string;
  email: string;
  mobile: string;
}

@Component({
  selector: 'sbpro-account-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-settings.component.pug',
  styleUrls: ['account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  @Input() accountId = '';
  @Input() merchantId = '';
  accountAuthorizers: AccountInputAuthorizerInterface[] = [];
  settingsForm!: FormGroup;
  status = '';
  toastHead = '';
  toastBody = '';
  accountStatus = '';
  showAccountStatus = false;
  vpa = '';
  upiEnabled = false;
  bank = '';
  errors: string[] = [];
  private _loading$ = new BehaviorSubject(false);
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }
  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private accountService: AccountsAdminService,
    private profileService: ProfileService,
    private router: Router,
    private utilityService: UtilityService
  ) {
    this.settingsForm = this.formBuilder.group({
      accountActivateCheckBox: true
    });
  }
  ngOnInit() {
    const subscribers = [];

    console.log('merchantId --==>>>', this.merchantId);

    subscribers.push(this.accountService.getAccount(this.accountId));
    subscribers.push(this.profileService.getProfile(this.merchantId, false));
    forkJoin(subscribers).subscribe(
      (resp: any) => {
        if (resp[0].success) {
          // @ts-ignore
          let account: Account = resp[0].result;
          console.log(account);
          this.bank = account.bank;
          this.accountStatus = account.status;
          this.showAccountStatus =
            this.accountStatus === accountsStatus.ACTIVE ||
            this.accountStatus === accountsStatus.INACTIVE ||
            this.accountStatus === accountsStatus.CLOSED ||
            this.accountStatus === accountsStatus.ACTIVATION_IN_PROGRESS
              ? true
              : false;
          this.accountStatus === accountsStatus.ACTIVE
            ? this.settingsForm.controls.accountActivateCheckBox.setValue(true)
            : this.settingsForm.controls.accountActivateCheckBox.setValue(
                false
              );
          if (account.vpa) {
            this.vpa = account.vpa;
          }
        }

        if (resp[1].success) {
          this.upiEnabled = resp[1].result.upiEnabled;
        }
        this.cdr.detectChanges();
      },
      error => {
        this.errors = error.error.errors;
        this.utilityService.showToast('Error', `${error.error.errors}`, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
      },
      () => {
        // 'onCompleted' callback.
        // No errors, route to new page here
      }
    );
  }

  updateCheckBoxVal(formControlName: string, event: Event) {
    this.settingsForm.controls[formControlName].patchValue(
      (event.target as HTMLInputElement).checked
    );
  }

  setAccountAuthorizers(accountAuthorizers: AccountInputAuthorizerInterface[]) {
    console.log(accountAuthorizers);
    this.accountAuthorizers = accountAuthorizers;
    this.cdr.detectChanges();
  }

  onSubmit() {
    const formData = {
      // authorizers: this.accountAuthorizers
    };
    // this.settingsForm.controls.accountActivateCheckBox.value
    //   ? Object.assign(formData, { status: accountsStatus.ACTIVE })
    //   : Object.assign(formData, { status: accountsStatus.INACTIVE });
    Object.assign(formData, { status: this.accountStatus });
    console.log(formData);

    // if (formData.authorizers.length > 0) {
    //   formData.authorizers.forEach((authorizer: authorizer) => {
    //     authorizer.email = authorizer.email.toLowerCase();
    //     authorizer.mobile = authorizer.mobile.toString();
    //   });
    // }
    console.log('FORM DATA ', formData);
    this.accountService
      .updateSettings(this.accountId, formData, this.merchantId)
      .subscribe(
        resp => {
          if (resp.success) {
            console.log(resp);
            this.toastBody = 'Account settings updated successfully.';
            this.toastHead = 'Success';
            this.utilityService.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-success text-white'
            });
            this.cdr.detectChanges();
          }
        },
        err => {
          this._loading$.next(false);
          this.errors = err.error.errors;
          this.toastHead = 'Failed';
          this.utilityService.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.cdr.detectChanges();
        }
      );
  }

  /**
   * Links VPA to Account
   */
  linkVPA() {
    this.accountService.linkVPA(this.accountId).subscribe(
      (resp: any) => {
        if (resp.success) {
          console.log(resp.result);
          if (resp.result.vpa) {
            this.toastBody = 'UPI Id is successfully added to the account.';
            this.toastHead = 'Success';
            this.utilityService.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-success text-white'
            });
            this.cdr.detectChanges();
            this.router.navigate([environment.urlAdminPrefix + '/allvpas/']);
          }
        }
      },
      err => {
        this.toastBody = err.error.errors[0];
        this.toastHead = 'Failed';
        this.utilityService.showToast(this.toastHead, this.toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
      }
    );
  }
}

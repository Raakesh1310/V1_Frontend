import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { UtilityService } from '@common/services';
import { ToastService } from '@common/services/toast.service';
import { User } from '@modules/auth/models/auth.model';
import { LoginResponseModel } from '@modules/auth/models/login-response.model';
import { NonceResponseModel } from '@modules/auth/models/nonce-resp.model';
import { OTPResponseModel } from '@modules/auth/models/otp-response.model';
import { getAccessFeatures } from '@modules/navigation/components/top-nav-merchant/team-access';
import { ProfileService } from '@modules/profile/services';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import apiResponseCodes from 'config/apiResponseCodes';
import * as crypto from 'crypto-js';
import { environment } from 'environments/environment';
import _ from 'lodash';
import { AuthService } from 'modules/auth/services/auth.service';
import { StorageService } from 'ngx-webstorage-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SESSION_STORAGE } from 'ngx-webstorage-service';
import { Inject, Injectable } from '@angular/core';

@Component({
  selector: 'sb-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.pug',
  styleUrls: ['login.component.scss']
})
export class LoginComponent {
  @ViewChild('confirmationModal') confirmationModal!: TemplateRef<unknown>;
  errors: string[];
  private count: number;
  loginForm: FormGroup;
  captchaDisabled = environment.captchaDisable;
  gAuthEnabled = false;
  loginOTPEnabled = false;
  loginInitiated = false;
  message = '';
  nonce = '';
  resend = false;
  timer = false;
  counter = 30;

  private _loading$ = new BehaviorSubject(false);

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private ngZone: NgZone,
    private profileService: ProfileService,
    private utilityService: UtilityService // private storageService: StorageService, // @Inject(SESSION_STORAGE) private sessionStorage: StorageService
  ) {
    this.modalService.dismissAll();
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(utilityService.emailRegex)
        ]
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      totp: [null, [Validators.minLength(6), Validators.maxLength(6)]],
      checkbox: [false],
      otp: [null, [Validators.minLength(4), Validators.maxLength(6)]]
    });

    try {
      this.message = this.router.getCurrentNavigation()?.extras?.state?.message;
    } catch (e) {
      console.log(e);
    }
    this.errors = [];
    this.count = 0;
  }

  onSubmit($event: string) {
    // console.log(this.loginInitiated);
    if (!this.loginInitiated) {
      this.auth
        .nonce(this.loginForm.get('email')?.value)
        .subscribe((resp: NonceResponseModel) => {
          if (resp.success) {
            this.nonce = resp.result.key;
            this.loginForm
              .get('password')
              ?.setValue(
                crypto.AES.encrypt(
                  this.loginForm.get('password')?.value,
                  this.nonce
                ).toString()
              );
            this.loginInitiated = true;
            if (!this.captchaDisabled) {
              this.proceedToLogin($event);
            } else {
              console.log('google reCaptcha disabled');
              this.proceedToLogin('');
            }
            this.cdr.detectChanges();
            return;
          }
        });
    } else {
      if (!this.captchaDisabled) {
        this.proceedToLogin($event);
      } else {
        console.log('google reCaptcha disabled');
        this.proceedToLogin('');
      }
    }
    /**
     * TODO: Recaptcha Service
     * Commenting this code, temporarily
     */
    // console.log('Going to Hit Recaptcha Service');
    // this.recaptchaV3Service
    //   .execute('loginSubmit')
    //   .subscribe((token: string) => {
    //     /**
    //      * Handle the response
    //      * got from the recaptcha service
    //      */
    //     console.log('Got following token from recaptcha service');
    //     console.log(token);
    //     this.proceedToLogin(token);
    //   });
    //
    // // Marking Touch all the fields
    // for (const key in this.loginForm.controls) {
    //   const control = this.loginForm.controls[key];
    //   control.markAllAsTouched();
    // }
  }

  resendLink() {
    this.errors = [
      `Please click on the verification link that we've sent to ${this.loginForm.controls.email.value}.`
    ];
    this.cdr.detectChanges();
    this.auth
      .resendVerificationLink(this.loginForm.controls.email.value)
      .subscribe();
  }

  removeOldErrors() {
    this.errors = [];
    this.cdr.detectChanges();
  }

  resendOTP() {
    if (this.timer === true) return;
    this.timer = true;
    this.loginForm.get('otp')?.setValue('');
    const resendOtp = setInterval(() => {
      this.counter -= 1;
      if (this.counter === 0) {
        this.timer = false;
        this.counter = 30;
        clearInterval(resendOtp);
      }
      this.cdr.detectChanges();
    }, 1000);
    const loginData = {} as User;
    loginData.email = this.loginForm.get('email')?.value;
    loginData.password = this.loginForm.get('password')?.value;
    // loginData.nonce = this.nonce;
    this.auth.resendLoginOTP(loginData).subscribe(
      (resp: OTPResponseModel) => {
        console.log(resp);
        this.cdr.detectChanges();
        this._loading$.next(false);
      },
      err => {
        this._loading$.next(false);
        console.log(err);
        if (err.status === 0) {
          this.errors = ['Connection Error'];
        }
        this.errors = err.error.errors;
        this.cdr.detectChanges();
      }
    );
    return;
  }

  proceedToLogin(token: string, OTPprovided?: boolean) {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.removeOldErrors();

    if (this.loginForm.status === 'VALID') {
      const loginData = {} as User;
      loginData.email = this.loginForm.get('email')?.value;
      loginData.password = this.loginForm.get('password')?.value;
      loginData.nonce = this.nonce;
      if (this.loginForm.get('totp')?.value) {
        loginData.totp = this.loginForm.get('totp')?.value;
      }
      if (this.loginForm.get('otp')?.value) {
        loginData.otp = this.loginForm.get('otp')?.value;
      }

      loginData.captchaToken = token;

      this._loading$.next(true);
      this.auth.login(loginData).subscribe(
        (resp: LoginResponseModel) => {
          console.log(resp);
          /**
           * Handle the success response
           * Got from the server
           */
          if (resp.code === apiResponseCodes.emailNotVerified) {
            this._loading$.next(false);
            this.errors = resp.errors;
            this.resend = true;
            this.cdr.detectChanges();
            return;
          }
          if (resp.success) {
            if (resp.result.otpSend) {
              this.loginOTPEnabled = true;
              this.errors = [];
              this.loginForm.controls.email.disable();
              this.loginForm.controls.password.disable();
              this.cdr.detectChanges();
              this._loading$.next(false);
            } else if (resp.result.gAuthRequired) {
              this.gAuthEnabled = true;
              this.errors = [];
              this.loginForm.controls.email.disable();
              this.loginForm.controls.password.disable();
              this.cdr.detectChanges();
              this._loading$.next(false);
            } else if (resp.result.resetPassword) {
              localStorage.clear();
              sessionStorage.clear();
              this.router
                .navigate([
                  `/auth/reset-password/${resp.result.verificationString}`
                ])
                .then(r => r)
                .catch(err => {
                  console.log(err);
                });
            } else {
              // this.router.navigate(['/kyc/business-Details']).then(r => r);

              if (
                resp.result.role === 'authorizer' ||
                resp.result.role === 'account_authorizer' || 
                resp.result.role === 'payee_authorizer'
              ) {
                if (resp.result.user.isSuperAdmin) {
                  this.router
                    .navigate([environment.urlAdminPrefix + '/approvals'])
                    .then(r => r);
                } else {
                  this.router
                    .navigate([environment.urlPortalPrefix + '/approvals'])
                    .then(r => r)
                    .catch(err => {
                      console.log(err);
                    });
                }
              } else if (resp.result.role.toLowerCase() === 'custom') {
                const accessObject = getAccessFeatures(resp.result.access);
                let redirectionUrl = '';
                switch (true) {
                  case accessObject.accountList:
                    redirectionUrl = '/portal/escrow';
                    break;
                  case accessObject.payeeList:
                    redirectionUrl = '/portal/payee';
                    break;
                  case accessObject.addPayee:
                    redirectionUrl = '/portal/payee/form';
                    break;
                  case accessObject.singleTransfer:
                    redirectionUrl = '/portal/transfer';
                    break;
                  case accessObject.bulkTransfer:
                    redirectionUrl = '/portal/transfer/bulk';
                    break;
                  case accessObject.escrowPages:
                    redirectionUrl = '/portal/escrow-page';
                    break;
                  case accessObject.challans:
                    redirectionUrl = '/portal/challan';
                    break;
                  case accessObject.bankAccounts:
                    redirectionUrl = '/portal/bank-account';
                    break;
                  case accessObject.depositList:
                    redirectionUrl = '/portal/bank-account/deposit';
                    break;
                  case accessObject.connectedBankingSingleTransfer:
                    redirectionUrl = '/portal/transfer/bank-accounts';
                    break;
                  case accessObject.connectedBankingBulkTransfer:
                    redirectionUrl = '/portal/transfer/bulk/bank-accounts';
                    break;
                  case accessObject.bankAccountTransfer:
                    redirectionUrl = '/portal/passbook/bank-accounts';
                    break;
                  case accessObject.myPassbook:
                    redirectionUrl = '/portal/transaction';
                    break;
                  default:
                    break;
                }

                this.router
                  .navigateByUrl(
                    this.route.snapshot.params.returnUrl || redirectionUrl
                  )
                  .then(r => {
                    this._loading$.next(false);
                  })
                  .catch(err => {
                    this._loading$.next(false);
                  });
              } else {
                this.router
                  .navigateByUrl(
                    this.route.snapshot.params.returnUrl || '/dashboard'
                  )
                  .then(r => {
                    this._loading$.next(false);
                  })
                  .catch(err => {
                    this._loading$.next(false);
                  });
              }
            }
            return;
          } else {
            this.loginInitiated = false;
            this.cdr.detectChanges;
          }

          /**
           * Error Occurred
           * while Logging in
           * So handle the error Here
           */
          if (!resp.result.gAuthVerified || !resp.result?.loginOTPVerified) {
            /**
             * If GAuth is enabled
             * then Handle errors
             * for Google Authenticator
             */
            this.errors = resp.errors;
            this.loginForm.controls.totp.setValue('');
            this.loginForm.controls.otp.setValue('');
            // this.loginInitiated = false;
            this.cdr.detectChanges();
          } else {
            /**
             * Handle Normal Errors
             */
            // console.log('Errors got from the api..');
            this.errors = resp.errors;
            this.loginForm.controls.totp.setValue('');
            this.loginForm.controls.password.setValue('');
            // this.loginInitiated = false;
            if (!this.captchaDisabled) {
              grecaptcha.reset();
            }
            // console.log(this.errors);

            // Update the view
            this.cdr.detectChanges();
          }
          this._loading$.next(false);
        },
        err => {
          this._loading$.next(false);
          this.errors = _.get(err, 'error.errors', ['Connection Error']);
          // if (err.status === 0) {
          //   this.errors = ['Connection Error'];
          // }
          this.cdr.detectChanges();
          // this.errors = [err.message];
        }
      );
      return;
    }
    // else {
    //   // console.log('Invalid form values');
    // }
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

  reset() {
    this.gAuthEnabled = false;
    this.loginOTPEnabled = false;
    this.errors = [];
    this.loginForm.controls.email.enable();
    this.loginForm.controls.password.enable();
    this.loginForm.reset();
  }

  _getDismissReason(reason: unknown): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  /* Accessor Methods */

  get emailControl() {
    return this.loginForm.get('email') as FormControl;
  }

  get emailControlValid() {
    return this.emailControl.touched && !this.emailControlInvalid;
  }

  get emailControlInvalid() {
    return (
      this.emailControl.touched &&
      (this.emailControl.hasError('required') ||
        this.emailControl.hasError('pattern'))
    );
  }

  get passwordControl() {
    return this.loginForm.get('password') as FormControl;
  }

  get passwordControlValid() {
    return this.passwordControl.touched && !this.passwordControlInvalid;
  }

  get passwordControlInvalid() {
    return (
      this.passwordControl.touched &&
      (this.passwordControl.hasError('required') ||
        this.passwordControl.hasError('minlength'))
    );
  }

  get totpControl() {
    return this.loginForm.get('totp') as FormControl;
  }

  get totpControlValid() {
    return this.totpControl.touched && !this.totpControl;
  }

  get totpControlInvalid() {
    return (
      this.totpControl.touched &&
      (this.totpControl.hasError('minLength') ||
        this.totpControl.hasError('maxLength'))
    );
  }

  get otpControl() {
    return this.loginForm.get('otp') as FormControl;
  }

  get otpControlValid() {
    return this.otpControl.touched && !this.otpControl;
  }

  get otpControlInvalid() {
    return (
      this.otpControl.touched &&
      (this.otpControl.hasError('minLength') ||
        this.otpControl.hasError('maxLength'))
    );
  }
}

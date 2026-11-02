import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
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
import { ToastService } from '@common/services';
import { User } from '@modules/auth/models';
import { RegisterResponseModel } from '@modules/auth/models/register-response.model';
import { AuthService } from '@modules/auth/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

import smsMsg91TemplateId from '../../../../config/smsMsg91TemplateId';

@Component({
  selector: 'sb-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.pug',
  styleUrls: ['register.component.scss']
})
export class RegisterComponent implements OnInit {
  @ViewChild('confirmationModal') confirmationModal!: TemplateRef<unknown>;
  errors: string[];
  private error: string;
  private showOTPInput = false;
  private showRegister = true;
  private enableWHATSAPP = environment.enableWHATSAPP;
  private _loading$ = new BehaviorSubject(false);

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  urlMode = '';
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    this.urlMode = this.router.url.split('-')[1];
    console.log(this.urlMode);

    this.errors = [];
    this.error = '';

    if (this.urlMode === 'enterprise') {
      this.registerForm = this.fb.group(
        {
          firstName: ['', [Validators.required]],
          lastName: ['', [Validators.required]],
          businessName: ['', [Validators.required]],
          mobile: ['', [Validators.required, Validators.minLength(10)]],
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(8)]],
          confirmPassword: ['', [Validators.required]],
          cb: [false, Validators.requiredTrue],
          otp: ['', [Validators.required]],
          whatsapp: [false, [Validators.required]]
        },
        { validator: this._checkPasswords }
      );
    } else {
      this.registerForm = this.fb.group(
        {
          firstName: ['', [Validators.required]],
          lastName: ['', [Validators.required]],
          mobile: ['', [Validators.required, Validators.minLength(10)]],
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(8)]],
          confirmPassword: ['', [Validators.required]],
          cb: [false, Validators.requiredTrue],
          otp: ['', [Validators.required]],
          whatsapp: [false, [Validators.required]]
        },
        { validator: this._checkPasswords }
      );
    }
  }

  ngOnInit() {
    this.showRegister = true;
  }

  removeOldErrors() {
    this.errors = [];
    this.cdr.detectChanges();
  }

  onSubmit() {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.removeOldErrors();

    if (this.registerForm.status === 'VALID') {
      const registrationData = {} as User;
      registrationData.email = this.registerForm.get('email')?.value;
      registrationData.otp = JSON.stringify(
        this.registerForm.get('otp')?.value
      );
      registrationData.mobile = this.registerForm.get('mobile')?.value;
      registrationData.role =
        this.urlMode === 'individual' ? 'individual' : 'user';
      registrationData.whatsapp = this.registerForm.get('whatsapp')?.value;
      registrationData.firstName = this.registerForm.get('firstName')?.value;
      registrationData.lastName = this.registerForm.get('lastName')?.value;
      registrationData.businessName =
        this.urlMode === 'individual'
          ? this.registerForm.get('firstName')?.value +
            this.registerForm.get('lastName')?.value
          : this.registerForm.get('businessName')?.value;
      registrationData.password = this.registerForm.get('password')?.value;
      registrationData.confirmPassword = this.registerForm.get(
        'confirmPassword'
      )?.value;

      console.log(registrationData);

      this._loading$.next(true);
      this.authService.register(registrationData).subscribe(
        (resp: RegisterResponseModel) => {
          this._loading$.next(false);
          if (resp.success) {
            this.showRegister = false;
            this.cdr.detectChanges();
            return;
          }

          // If Not success, then show the error
          console.log('Errors got from the api');
          console.log(resp.errors);
          this.errors = resp.errors;
          this.cdr.detectChanges();
        },
        err => {
          this._loading$.next(false);
          if (err.status === 0) {
            this.errors = ['Connection Error'];
          } else {
            this.errors = err.error.errors;
          }
          this.cdr.detectChanges();
        }
      );
    }

    // Now Retouch all the fields
    for (const key in this.registerForm.controls) {
      const control = this.registerForm.controls[key];
      control.markAllAsTouched();
    }
  }

  loginRedirect() {
    this.router
      .navigateByUrl(this.route.snapshot.params.returnUrl || '/')
      .then(r => r);
  }

  tncLink() {
    const link = (environment.apiHost + '/ProtectPay_T&C.pdf').toString();
    console.log(link);
    return link;
  }

  resendLink() {
    this.authService
      .resendVerificationLink(this.registerForm.controls.email.value)
      .subscribe();
  }

  sendOTP() {
    if (this.mobileControlValid) {
      this.showOTPInput = true;
      const mobile = this.registerForm.get('mobile')?.value;
      this.authService
        .sendOTP(mobile, smsMsg91TemplateId.registerMobileOtp)
        .subscribe(resp => {
          console.log('otp sent...', resp);
        });
    }
  }

  _checkPasswords(group: FormGroup) {
    const pass = group.controls.password.value;
    const confirmPass = group.controls.confirmPassword.value;

    return pass === confirmPass ? null : { passwordMismatch: true };
  }

  /* Accessor Methods */

  get otpControl() {
    return this.registerForm.get('otp') as FormControl;
  }

  get otpControlValid() {
    return this.otpControl.touched && !this.otpControlInvalid;
  }

  get otpControlInvalid() {
    return this.otpControl.touched && this.otpControl.hasError('required');
  }

  get firstNameControl() {
    return this.registerForm.get('firstName') as FormControl;
  }

  get firstNameControlValid() {
    return this.firstNameControl.touched && !this.firstNameControlInvalid;
  }

  get firstNameControlInvalid() {
    return (
      this.firstNameControl.touched &&
      this.firstNameControl.hasError('required')
    );
  }

  get lastNameControl() {
    return this.registerForm.get('lastName') as FormControl;
  }

  get lastNameControlValid() {
    return this.lastNameControl.touched && !this.lastNameControlInvalid;
  }

  get lastNameControlInvalid() {
    return (
      this.lastNameControl.touched && this.lastNameControl.hasError('required')
    );
  }

  get businessNameControl() {
    return this.registerForm.get('businessName') as FormControl;
  }

  get businessNameControlValid() {
    if (this.urlMode === 'enterprise') {
      return (
        this.businessNameControl.touched && !this.businessNameControlInvalid
      );
    }

    return null;
  }

  get businessNameControlInvalid() {
    if (this.urlMode === 'enterprise') {
      return (
        this.businessNameControl.touched &&
        this.businessNameControl.hasError('required')
      );
    }
    return null;
  }

  get mobileControl() {
    return this.registerForm.get('mobile') as FormControl;
  }

  get mobileControlValid() {
    return this.mobileControl.touched && !this.mobileControlInvalid;
  }

  get mobileControlInvalid() {
    return (
      this.mobileControl.touched &&
      (this.mobileControl.hasError('required') ||
        this.mobileControl.hasError('mobile'))
    );
  }

  get emailControl() {
    return this.registerForm.get('email') as FormControl;
  }

  get emailControlValid() {
    return this.emailControl.touched && !this.emailControlInvalid;
  }

  get emailControlInvalid() {
    return (
      this.emailControl.touched &&
      (this.emailControl.hasError('required') ||
        this.emailControl.hasError('email'))
    );
  }

  get passwordControl() {
    return this.registerForm.get('password') as FormControl;
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

  get confirmPasswordControl() {
    return this.registerForm.get('confirmPassword') as FormControl;
  }

  get confirmPasswordControlValid() {
    return (
      this.confirmPasswordControl.touched && !this.confirmPasswordControlInvalid
    );
  }

  get confirmPasswordControlInvalid() {
    return (
      this.confirmPasswordControl.touched &&
      (this.confirmPasswordControl.hasError('required') ||
        this.confirmPasswordControl.hasError('minlength') ||
        this.registerForm.hasError('passwordMismatch'))
    );
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
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services/toast.service';
import { AuthService } from '@modules/auth/services';
import { ProfileService } from '@modules/profile/services';

@Component({
  selector: 'sbpro-g-auth',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './g-auth.component.pug',
  styleUrls: ['./g-auth.component.scss']
})
export class GAuthComponent implements OnInit {
  errors: string[];
  gauthEnabled = false;
  qr = '';
  showQR = false;
  toastHead = '';
  toastBody = '';
  openForm = false;
  isLoginOTPEnabled = false;
  enableLoginOTP = false;
  otpForm = this.fb.group({
    otp: [
      '',
      [Validators.required, Validators.minLength(4), Validators.maxLength(6)]
    ]
  });

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toastService: ToastService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.errors = [];
  }

  ngOnInit() {
    this.gAuthEnabled();
    this.loginOTPEnabled();
  }

  gAuthEnabled() {
    this.profileService.gAuthEnabled().subscribe(resp => {
      if (resp.success) {
        this.gauthEnabled = resp.result;
        this.errors = [];
      } else {
        this.errors = resp.errors;
      }
      this.cdr.detectChanges();
    });
  }

  loginOTPEnabled() {
    this.profileService.loginOTPEnabled().subscribe(resp => {
      if (resp.success) {
        this.isLoginOTPEnabled = resp.result;
        this.errors = [];
      } else {
        this.errors = resp.errors;
      }
      this.cdr.detectChanges();
    });
  }

  enableSendOTP() {
    // Add otp sending feature here
    this.profileService.sendLoginOTP().subscribe(resp => {
      if (resp.success) {
        this.enableLoginOTP = true;
        this.showToast('Success', 'OTP send successfull.', {
          headerClasses: 'bg-success text-white'
        });
      } else {
        this.showToast('Failure', 'Failed to send OTP.', {
          headerClasses: 'bg-danger text-white'
        });
      }
      this.cdr.detectChanges();
    });
  }

  enableLoginOTPFn() {
    if (this.otpForm.status === 'VALID') {
      const OTP = this.otpForm.get('otp')?.value;
      this.profileService.enableLoginOTP(OTP).subscribe(resp => {
        if (resp.success) {
          this.errors = [];
          this.gauthEnabled = false;
          this.showQR = false;
          this.isLoginOTPEnabled = true;
          this.toastBody = '2-Factor Authentication enabled.';
          this.toastHead = 'Success';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-success text-white'
          });
        } else {
          this.otpForm.reset();
          this.errors = resp.errors;
        }
        this.cdr.detectChanges();
      });
    }

  }

  generateGAuthQR() {
    this.profileService.generateGAuthQR().subscribe(resp => {
      if (resp.success) {
        this.otpForm.reset();
        this.showQR = true;
        this.qr = resp.result;
        this.errors = [];
      } else {
        this.errors = resp.errors;
      }
      this.cdr.detectChanges();
    });
  }

  disable() {
    this.errors = [];
    this.otpForm.reset();
    this.openForm = true;
    this.cdr.detectChanges();
  }

  onCancel() {
    this.errors = [];
    this.otpForm.reset();
    this.openForm = false;
    this.showQR = false;
    this.cdr.detectChanges();
  }

  onCancelLoginOTP() {
    this.errors = [];
    this.otpForm.reset();
    this.enableLoginOTP = false;
    this.cdr.detectChanges();
  }

  disableGAuth() {
    if (this.otpForm.status === 'VALID') {
      const OTP = this.otpForm.get('otp')?.value;
      this.profileService.disableGAuth(OTP).subscribe(resp => {
        if (resp.success) {
          this.otpForm.reset();
          this.openForm = false;
          this.errors = [];
          this.showQR = false;
          this.gauthEnabled = false;
          this.toastBody = '2-Factor Authentication disabled.';
          this.toastHead = 'Success';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-success text-white'
          });
        } else {
          this.errors = resp.errors;
        }
        this.cdr.detectChanges();
      });
    }
  }

  disableLoginOTP() {
    if (this.otpForm.status === 'VALID') {
      const OTP = this.otpForm.get('otp')?.value;
      this.profileService.disableLoginOTP(OTP).subscribe(resp => {
        if (resp.success) {
          this.otpForm.reset();
          this.openForm = false;
          this.errors = [];
          this.showQR = false;
          this.gauthEnabled = false;
          this.toastBody = '2-Factor Authentication disabled.';
          this.toastHead = 'Success';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-success text-white'
          });
        } else {
          this.errors = resp.errors;
        }
        this.cdr.detectChanges();
      });
    }
  }

  enableGAuth() {
    if (this.otpForm.status === 'VALID') {
      const OTP = this.otpForm.get('otp')?.value;
      this.profileService.enableGAuth(OTP).subscribe(resp => {
        if (resp.success) {
          this.errors = [];

          this.gauthEnabled = true;
          this.openForm = false;
          this.isLoginOTPEnabled = false;
          this.enableLoginOTP = false;

          this.toastBody = '2-Factor Authentication enabled.';
          this.toastHead = 'Success';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-success text-white'
          });
        } else {
          this.otpForm.reset();
          this.errors = resp.errors;
        }
        this.cdr.detectChanges();
      });
    }
  }

  get otpControl() {
    return this.otpForm.get('otp') as FormControl;
  }

  get otpControlValid() {
    return this.otpControl.touched && !this.otpControl;
  }

  get otpControlInvalid() {
    return (
      this.otpControl.touched &&
      (this.otpControl.hasError('required') ||
        this.otpControl.hasError('minLength') ||
        this.otpControl.hasError('maxLength'))
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

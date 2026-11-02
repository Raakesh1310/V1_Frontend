import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OtpModalComponent } from '@common/components';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import { AuthService } from '@modules/auth/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import smsMsg91TemplateId from 'config/smsMsg91TemplateId';
import { Subscription } from 'rxjs';

@Component({
  selector: 'sbpro-reset-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reset-password.component.pug',
  styleUrls: ['reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  private subscription: Subscription | undefined;
  //   key: string | null;
  valid = true;
  errors: Array<string> = [];
  isDone = false;
  email = '';
  linkExpired = false;
  key: string | null;
  resetForm = this.fb.group({
    pass: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', [Validators.required]],
    otp: ['']
  });
  toastHead = '';
  toastBody = '';
  mobile!: number;
  openOTPModal = false;
  timer = false;
  counter = 30;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private toastService: ToastService,
    private modalService: NgbModal
  ) {
    this.key = this.route.snapshot.paramMap.get('key');

    this.auth.validatePasswordResetKey(this.key).subscribe(
      (resp: any) => {
        if (!resp.success) {
          this.valid = false;
          this.cdr.detectChanges();
        } else {
          this.mobile = resp.result.mobile;
          this.cdr.detectChanges();
        }
      },
      err => {
        this.valid = false;
        this.errors = err.error.errors;
        this.cdr.detectChanges();
      }
    );
  }

  ngOnInit() {
    this.toastBody = 'Your password has expired. Please reset your password.';
    this.toastHead = 'Reset Password.';
    this.showToast(this.toastHead, this.toastBody, {
      headerClasses: 'bg-success text-white'
    });
    this.cdr.detectChanges();
  }

  onReset() {
    this.errors = [];

    if (!this.openOTPModal) {
      this.auth
        .sendKYCOTP(
          this.mobile.toString(),
          smsMsg91TemplateId.registerMobileOtp
        )
        .subscribe(
          resp => {
            console.log('otp sent...', resp);

            this.openOTPModal = true;
            this.cdr.detectChanges();
          },
          err => {
            this.valid = false;
            this.errors = err.error.errors;
            this.cdr.detectChanges();
          }
        );

      return;
    }

    if (!this.resetForm.controls.otp.value) {
      this.errors.push('Please enter OTP.');
      return;
    }

    if (
      this.resetForm.controls.pass.value !==
      this.resetForm.controls.confirm.value
    ) {
      this.errors.push(`Confirm password didn't match!`);
      return;
    }
    if (this.resetForm.valid) {
      this.subscription = this.auth
        .resetPasswordWithHistory(
          this.resetForm.controls.pass.value,
          this.resetForm.controls.confirm.value,
          this.key,
          this.resetForm.controls.otp.value
        )
        .subscribe(
          (resp: any) => {
            if (resp.success) {
              this.router.navigate(['auth/login']);
              this.cdr.detectChanges();
            } else {
              this.errors = resp.errors;
              this.openOTPModal = false;
              this.cdr.detectChanges();
            }
          },
          err => {
            this.errors = err.error.errors;
            this.resetForm.controls.otp.reset();
            this.openOTPModal = false;
            this.cdr.detectChanges();
          }
        );
    } else {
      console.log('invalid values');
    }
  }

  resendOTP() {
    if (this.timer === true) return;
    this.timer = true;
    this.resetForm.get('otp')?.setValue('');
    const resendOtp = setInterval(() => {
      this.counter -= 1;
      if (this.counter === 0) {
        this.timer = false;
        this.counter = 30;
        clearInterval(resendOtp);
      }
      this.cdr.detectChanges();
    }, 1000);
    this.auth
      .resendKYCOTP(
        this.mobile.toString(),
        smsMsg91TemplateId.registerMobileOtp
      )
      .subscribe(
        resp => {
          console.log('otp sent...', resp);

          this.openOTPModal = true;
          this.cdr.detectChanges();
        },
        err => {
          this.valid = false;
          this.errors = err.error.errors;
          this.cdr.detectChanges();
        }
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

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OtpModalComponent } from '@common/components';
import { AuthService } from '@modules/auth/services';
import { ProfileService } from '@modules/profile/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import smsMsg91TemplateId from 'config/smsMsg91TemplateId';

@Component({
  selector: 'sbpro-profile-password-reset',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-password-reset.component.pug',
  styleUrls: ['profile-password-reset.component.scss']
})
export class ProfilePasswordResetComponent implements OnInit {
  errors: string[] = [];
  success: string[] = [];
  passForm = new FormGroup({
    currentPassword: new FormControl(null, [
      Validators.required,
      Validators.minLength(8)
    ]),
    newPassword: new FormControl(null, [
      Validators.required,
      Validators.minLength(8)
    ]),
    confirmPassword: new FormControl(null, [
      Validators.required,
      Validators.minLength(8)
    ]),
    otp: new FormControl(null)
  });

  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  confirmPassword() {
    const pass = this.passForm.get('newPassword')?.value;
    const confirm = this.passForm.get('confirmPassword')?.value;
    return confirm !== pass;
  }

  currentPassword() {
    const pass = this.passForm.get('newPassword')?.value;
    const old = this.passForm.get('currentPassword')?.value;
    return old === pass;
  }

  sendOTP() {
    this.errors = [];
    if (this.currentPassword()) {
      this.errors.push('New password cannot be same as current password.');
      this.cdr.detectChanges();
      return;
    }

    if (this.confirmPassword()) {
      this.errors.push('Confirm Password did not match.');
      this.cdr.detectChanges();
      return;
    }

    const modalRef = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.doClose = modalRef;
    modalRef.componentInstance.templateId = smsMsg91TemplateId.transferOtp;
    modalRef.componentInstance.message = `Changing password requires you to enter OTP sent over your registered mobile number "${this.authService.getMobile()}"`;
    modalRef.componentInstance.passOtp.subscribe((otp: number) => {
      if (otp) {
        this.passForm.patchValue({
          otp
        });
        this.onSubmit();
      } else {
        console.log('something went with modal');
      }
    });
  }

  async onSubmit() {
    this.errors = [];

    await this.profileService.updatePass(this.passForm.value).subscribe(
      resp => {
        if (!resp.success) {
          resp.errors.forEach(err => this.errors.push(err));
          this.success = [];
        } else {
          this.success.push('Password updated successfully.');
          this.errors = [];
          this.passForm.reset();
        }
        console.log(this.errors);
        this.cdr.detectChanges();
      },
      err => {
        console.log(err);
        this.errors = err.error.errors;
        this.cdr.detectChanges();
      }
    );
  }
}

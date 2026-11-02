import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { UtilityService } from '@common/services';
import { AuthService } from '@modules/auth/services';
import { ProfileService } from '@modules/profile/services';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import smsMsg91FlowId from 'config/smsMsg91FlowId';
import smsMsg91TemplateId from 'config/smsMsg91TemplateId';

@Component({
  selector: 'sbpro-notification-detail-update',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-detail-update.component.pug',
  styleUrls: ['notification-detail-update.component.scss']
})
export class NotificationDetailUpdateComponent implements OnInit {
  placeholder = '';
  otpsent = false;
  errors = '';

  reMobile = /^\d{10}$/;
  reEmail = /\S+@\S+\.\S+/;
  updatedMobile = 0;
  updateEmail = '';
  timer = false;
  counter = 30;

  @ViewChild('defInput') defInput!: ElementRef;
  @ViewChild('otp') otp!: ElementRef;

  @Input() type = 'mobile';
  @Input() doClose?: NgbModalRef;
  @Input() header = 'Change Mobile Number';
  @Input() message = 'Please provide your updated detail.';
  constructor(
    private cdr: ChangeDetectorRef,
    private utilityService: UtilityService,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.placeholder = `Please enter your new ${this.type}`;
  }

  resendOTP() {
    if (this.type === 'email') {
      this.timer = true;
      const resendOtp = setInterval(() => {
        this.counter -= 1;
        if (this.counter === 0) {
          this.timer = false;
          this.counter = 30;
          clearInterval(resendOtp);
        }
      }, 1000);
      return;
    }
    this.utilityService
      .sendOTP(smsMsg91TemplateId.registerMobileOtp, this.updatedMobile)
      .subscribe();
    this.timer = true;
    const resendOtp = setInterval(() => {
      this.counter -= 1;
      if (this.counter === 0) {
        this.timer = false;
        this.counter = 30;
        clearInterval(resendOtp);
      }
    }, 1000);
  }

  sendOTP() {
    if (this.type == 'email') {
      if (
        !this.defInput.nativeElement.value ||
        !this.reEmail.test(this.defInput.nativeElement.value)
      ) {
        this.errors = 'Please enter a valid email address';
        this.cdr.detectChanges();
        return;
      }
      this.updateEmail = this.defInput.nativeElement.value;
    }
    if (this.type == 'mobile') {
      if (
        !this.defInput.nativeElement.value ||
        !this.reMobile.test(this.defInput.nativeElement.value.toString())
      ) {
        this.errors = 'Please enter a valid 10 digit mobile number';
        this.cdr.detectChanges();
        return;
      }
      this.updatedMobile = this.defInput.nativeElement.value;
      this.utilityService
        .sendOTP(smsMsg91TemplateId.registerMobileOtp, this.updatedMobile)
        .subscribe();
      this.otpsent = true;
      this.header = 'Verify your mobile number';
    }
  }

  update(otp: number) {
    this.profileService
      .updateMobile(this.updatedMobile, this.otp.nativeElement.value)
      .subscribe(
        (resp: any) => {
          console.log(resp);
          if (resp.success) {
            console.log(resp);
            this.authService.setMobile(resp.result.mobile.toString());
            this.doClose?.close(resp.result.mobile.toString());
          }
        },
        (err: any) => {
          this.errors = err.error.errors;
          this.cdr.detectChanges();
        }
      );
  }

  closer() {
    this.doClose?.close();
  }
}

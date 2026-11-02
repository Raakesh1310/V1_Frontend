import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OtpModalComponent } from '@common/components/otpmodal/otp-modal.component';
import { AuthService } from '@modules/auth/services';
import { ProfileService } from '@modules/profile/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import mailOTPTemplate from 'config/mailOTPTemplate';
import notificationSettingConst from 'config/notificationSettingConst';
import { environment } from 'environments/environment';

import { NotificationSetting, NotificationSettingModel } from '../../models';
import { NotificationDetailUpdateComponent } from '../notification-detail-update/notification-detail-update.component';

@Component({
  selector: 'sbpro-notification-settings',
  templateUrl: './notification-settings.component.pug',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {
  whatsapp = false;
  mobile: string | null = '';
  email: string | null = '';
  modalRef?: NgbModalRef;
  errors: string[] = [];
  whatsappEnabled: boolean = environment.enableWHATSAPP;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) {
    this.mobile = this.authService.getMobile();
    this.email = this.authService.getEmail();

    this.profileService
      .getNotificationSettings()
      .subscribe((resp: NotificationSettingModel) => {
        console.log(resp);
        const whatsappNotification: NotificationSetting[] = resp.result.filter(
          (notification: NotificationSetting) =>
            notification.type === notificationSettingConst.whatsapp
        );
        console.log(whatsappNotification[0].active);
        this.whatsapp = whatsappNotification[0].active;
        this.cdr.detectChanges();
      });
  }

  ngOnInit(): void {}

  openMobileEditor() {
    // open OTP verification modal
    this.modalRef = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    this.modalRef.componentInstance.doClose = this.modalRef;
    this.modalRef.componentInstance.type = 'email';
    this.modalRef.componentInstance.emailTemplate =
      mailOTPTemplate.UPDATE_MOBILE;
    this.modalRef.componentInstance.message = `Changing mobile number requires you to enter OTP sent over your registered email address "${this.authService.getEmail()}"`;
    this.modalRef.result.then((resp: boolean) => {
      if (resp) {
        console.log('verified');
        this.updateMobileDetails();
        return;
      }
      console.log('verification failed');
    });
  }

  updateMobileDetails() {
    this.modalRef = this.modalService.open(NotificationDetailUpdateComponent, {
      backdrop: 'static',
      size: 'md'
    });
    this.modalRef.componentInstance.doClose = this.modalRef;
    this.modalRef.componentInstance.type = 'mobile';
    this.modalRef.componentInstance.message = 'Enter your phone number';
    this.modalRef.componentInstance.emailTemplate = 'UPDATE_MOBILE';
    this.modalRef.result.then((resp: string) => {
      if (resp) {
        this.mobile = resp;
        this.cdr.detectChanges();
        return;
      }
      this.errors = ['Failed to update mobile'];
    });
  }

  updateWhatsappSetting(checkbox: HTMLInputElement) {
    if (checkbox.checked) {
      this.profileService
        .updateNotificationSettings(notificationSettingConst.whatsapp, true)
        .subscribe((resp: any) => {
          if (resp.success) {
            this.whatsapp = true;
            this.cdr.detectChanges();
            return;
          }
        });
    } else {
      this.profileService
        .updateNotificationSettings(notificationSettingConst.whatsapp, false)
        .subscribe((resp: any) => {
          if (resp.success) {
            this.whatsapp = false;
            this.cdr.detectChanges();
            return;
          }
        });
    }
  }
}

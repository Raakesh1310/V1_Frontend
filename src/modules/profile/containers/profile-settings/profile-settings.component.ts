import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { ProfileResponseModel } from '@modules/profile/models';
import { ProfileService } from '@modules/profile/services';
import merchantUserRoles from 'config/merchantUserRoles';

@Component({
  selector: 'sbpro-profile-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-settings.component.pug',
  styleUrls: ['profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit {
  canManageApiCredential = false;
  // navNames: string[] = [];
  @ViewChild('resetPassword') resetPassword?: ElementRef;
  @ViewChild('apicred') apicred?: ElementRef;
  @ViewChild('twofa') twofa?: ElementRef;
  @ViewChild('notifications') notifications?: ElementRef;

  navNames: string[] = [];
  templates: any[] = [];

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {
    // if (this.canManageApiCredential) {
    //   this.navNames = [
    //     'Password Reset',
    //     'API Credentials',
    //     '2-Factor Authentication'
    //   ];
    // } else {
    //   this.navNames = ['Password Reset', '2-Factor Authentication'];
    // }
  }

  ngOnInit() {
    // this.navNames = ['Password Reset', '2-Factor Authentication'];
    // this.templates = [this.resetPassword, this.twofa];
    // if (environment.enableWHATSAPP) {
    //   this.navNames.push('Notifications');
    //   this.templates.push(this.notifications);
    // }
    this.profileService
      .getProfile(null, false)
      .subscribe((resp: ProfileResponseModel) => {
        if (resp.result) {
          if (
            resp.result.mode !== 'Portal' &&
            this.authService.getRole().some(r => [merchantUserRoles.OWNER, merchantUserRoles.TRUSTEE].includes(r))
          ) {
            this.canManageApiCredential = true;
            this.cdr.detectChanges();
          }
        }
      });

    // if (this.authService.getRole().indexOf(merchantUserRoles.OWNER) > -1) {
    //   this.canManageApiCredential = true;
    // }

    this.cdr.detectChanges();
  }
}

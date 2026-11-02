import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl
} from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UtilityService } from '@common/services/utility.service';
import { AuthService, UserService } from '@modules/auth/services';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import merchantUserRoles from 'config/merchantUserRoles';

@Component({
  selector: 'sbpro-top-nav-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-nav-user.component.pug',
  styleUrls: ['top-nav-user.component.scss']
})
export class TopNavUserComponent implements OnInit {
  @Input() placement = 'bottom-right';
  dropdownClasses: string[] = [];
  imageUri!: SafeUrl;
  fullName: string | null = '';
  merchantId = '';
  role: string[] = [];
  email = '';

  constructor(
    public userService: UserService,
    private authService: AuthService,
    private router: Router,
    private utilityService: UtilityService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let imageUriName = this.authService.getLogo() || '';
    if (imageUriName) {
      if (imageUriName.includes('/')) imageUriName = imageUriName.split('/').pop() as string;
      this.utilityService
        .fetchFile(imageUriName, S3FolderName.PROFILE)
        .subscribe(
          resp => {
            const objectURL = URL.createObjectURL(resp.body as any);
            this.imageUri = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            this.cdr.detectChanges();
          },
          error => {
            console.error('Cannot show image due to error ', error);
          }
        );
    }
    this.fullName = this.authService.getFullName();
    this.email = this.authService.getEmail() || '';
    this.role = this.authService.getRole();
    if (this.role.indexOf(merchantUserRoles.CUSTOM) > -1) {
      this.role.push(this.authService.getRoleName() || '');
    }
    this.merchantId = this.authService.getMerchantId() || '';
    this.cdr.detectChanges();
  }

  handleLogoutClick() {
    this.authService.logOut().subscribe(resp => {
      if (resp.success) {
        return this.router.navigateByUrl('/auth');
      }
      console.log('Error Occurred Logged out');
    });
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { NavigationService } from '@modules/navigation/services';
import { Router } from '@angular/router';
import StorageService from '@common/services/storage.service';
import { environment } from '../../../../environments/environment';
import { NotificationsService } from '@modules/notifications/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  LOCAL_STORAGE,
  SESSION_STORAGE,
  WebStorageService
} from 'ngx-webstorage-service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'sb-top-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-nav.component.pug',
  styleUrls: ['top-nav.component.scss']
})
export class TopNavComponent implements OnInit {
  @Input() rtl = false;

  individual = this.authService.isIndividual();
  MERCHANT_USER = 'merchant_user';

  portalNotification: any = null;

  @ViewChild('NoticeModal', { static: false })
  noticeModal!: TemplateRef<void>;

  modalRef: NgbModalRef | null = null;
  shouldDisplayStrip = false;

  dontShowAgain: boolean = false;

  constructor(
    private navigationService: NavigationService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService,
    private notificationService: NotificationsService,
    private modalService: NgbModal,
    @Inject(SESSION_STORAGE) private sessionStorage: WebStorageService,
    @Inject(LOCAL_STORAGE) private localStorage: WebStorageService,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    if (!this.authService.isSuperAdmin()) {
      this.notificationService.findOne(new Date(), new Date()).subscribe(
        (res: any) => {
          if (res.success) {
            this.portalNotification = res.result[0];
            const lastNotificationID = this.localStorage.get(
              environment.LAST_NOTICE_ID
            );

            if (res.result[0]?._id !== lastNotificationID) {
              // * if there is a new notification, the the merchant needs to see it
              this.localStorage.set(environment.NOTICE_MODAL_SHOW_AGAIN, true);
              // * set the new notification id
              this.localStorage.set(
                environment.LAST_NOTICE_ID,
                res.result[0]._id
              );
            }

            this.dontShowAgain = !this.localStorage.get(
              environment.NOTICE_MODAL_SHOW_AGAIN
            );

            // * this condition checks if the notice should be shown again and the user should want it
            if (
              !this.sessionStorage.get(environment.NOTICE_MODAL_VIEWED) &&
              this.localStorage.get(environment.NOTICE_MODAL_SHOW_AGAIN)
            ) {
              this.openNoticeModal();
            } else if (
              !this.localStorage.get(environment.NOTICE_MODAL_SHOW_AGAIN)
            ) {
              this.sessionStorage.set(environment.NOTICE_MODAL_VIEWED, true);
              this.displaySummaryStrip();
            }

            this.displaySummaryStrip();
            this.cdr.detectChanges();
          }
        },
        err => {
          console.log('Failed to load notifications');
          console.log(err);
        }
      );
    }
  }

  toggleSideNav() {
    this.navigationService.toggleSideNav();
  }

  NavigateToDashboard() {
    console.log('ROLE ', this.storageService.getItem(this.MERCHANT_USER));
    let merchant = this.storageService.getItem(this.MERCHANT_USER);
    if (
      merchant.role === 'authorizer' ||
      merchant.role === 'account_authorizer'
    ) {
      if (merchant.user.isSuperAdmin) {
        this.router
          .navigate([environment.urlAdminPrefix + '/approvals'])
          .then(r => r);
      } else {
        this.router
          .navigate([environment.urlPortalPrefix + '/approvals'])
          .then(r => r);
      }
    } else {
      this.router.navigate(['/dashboard']).then(r => r);
    }
  }

  /**
   * Function that closes the notice modal on user click
   */
  closeNoticeModal() {
    this.sessionStorage.set(environment.NOTICE_MODAL_VIEWED, true);
    this.localStorage.set(
      environment.NOTICE_MODAL_SHOW_AGAIN,
      !this.dontShowAgain
    );
    this.modalRef?.close();
    this.displaySummaryStrip();
    this.cdr.detectChanges();
  }

  /**
   * Opens the notice modal
   */
  openNoticeModal() {
    this.modalRef = this.modalService.open(this.noticeModal, {
      backdrop: 'static',
      size: this.portalNotification?.modalSize || 'md' 
    });
    this.cdr.detectChanges();
  }

  /**
   * Returns whether the summary strip above navbar should be displayed
   */
  displaySummaryStrip() {
    this.shouldDisplayStrip =
      !!this.portalNotification &&
      this.sessionStorage.get(environment.NOTICE_MODAL_VIEWED);

    this.cdr.detectChanges();
  }

  trustHtml(content: any) {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  setDontShow($event: any) {
    this.dontShowAgain = $event.target.checked;
    this.cdr.detectChanges();
  }
}

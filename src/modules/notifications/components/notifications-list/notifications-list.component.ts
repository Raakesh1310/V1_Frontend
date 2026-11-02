import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastService } from '@common/services';
import { NotificationsService } from '@modules/notifications/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'sbpro-notifications-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-list.component.pug',
  styleUrls: ['notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit {
  _loading$!: BehaviorSubject<boolean>;
  notifications!: any[];

  modalRef: NgbModalRef | null = null;

  @ViewChild('NoticeModal', { static: false })
  noticeModal!: TemplateRef<void>;

  @ViewChild('DeletionConfirmation', { static: false })
  deletionConfirmationModal!: TemplateRef<void>;

  portalNotification = null;
  notificationToDelete: any = null;
  itemsPerPage = 10;
  totalItemsCount = 0;
  page = 1;

  loadingStates!: any;

  constructor(
    private toastService: ToastService,
    private notificationService: NotificationsService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    public sanitizer: DomSanitizer
  ) {
    this._loading$ = new BehaviorSubject<boolean>(false);
  }

  ngOnInit() {
    this._loading$.next(true);
    this.loadNotifications();
    this.cdr.detectChanges();
  }

  /**
   * Calls notifications service function to fetch all notifications
   */
  loadNotifications() {
    this.notificationService.getAllNotifications().subscribe(
      (res: any) => {
        if (res.success) {
          this.notifications = res.result;
          this.totalItemsCount = res.allItemsCount;
          this.loadingStates = {};
          res.result.forEach((entry: any) => {
            if (entry.active) {
              this.loadingStates = { ...this.loadingStates, [entry.id]: false };
            }
          });
          this.cdr.detectChanges();
        }
        this._loading$.next(false);
      },
      err => {
        this.toastService.show('Error', err.error.errors[0], {
          ...ToastService.defaultOptions,
          ...ToastService.errorHeaderOptions
        });
        this._loading$.next(false);
      }
    );
  }

  /**
   * To format date in user readable form
   * @param date Date
   * @returns string
   */
  formatDate(date: string) {
    const options: any = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(date).toLocaleDateString('en-GB', options);
  }

  /**
   * To delete a notification
   * @param _id ObjectId of the notification
   */
  deleteNotification() {
    this.closeModal();

    this.loadingStates = {
      ...this.loadingStates,
      [this.notificationToDelete!._id]: true
    };
    this.cdr.detectChanges();

    this.notificationService
      .deleteNotification(this.notificationToDelete!._id)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.toastService.show(
              'Success',
              'Notification deleted successfully',
              {
                ...ToastService.successHeaderOptions,
                ...ToastService.defaultOptions
              }
            );

            this.loadNotifications();
          }
        },
        err => {
          console.log(err);
          this.toastService.show('Error', err.error.errors[0], {
            ...ToastService.errorHeaderOptions,
            ...ToastService.defaultOptions
          });
        }
      );
  }

  /**
   * Closes the notification modal on user click
   */
  closeModal() {
    this.modalRef?.close();
  }

  /**
   * Opens any notification in form of a modal to view the details
   * @param entry notification data
   */
  openNoticeModal(entry: any) {
    this.portalNotification = entry;
    this.modalRef = this.modalService.open(this.noticeModal);
    this.cdr.detectChanges();
  }

  changePage($event: any) {
    this.notificationService.changePage($event).subscribe(
      (res: any) => {
        if (res.success) {
          this.notifications = res.result;
          this.totalItemsCount = res.allItemsCount;
          this.cdr.detectChanges();
        }
        this._loading$.next(false);
      },
      err => {
        this.toastService.show('Error', err.error.errors[0], {
          ...ToastService.defaultOptions,
          ...ToastService.errorHeaderOptions
        });
        this._loading$.next(false);
      }
    );
  }

  getLoadingState(_id: string): boolean {
    return this.loadingStates[_id];
  }

  openDeletionConfirmationModal(entry: any) {
    this.notificationToDelete = entry;
    this.modalRef = this.modalService.open(this.deletionConfirmationModal);
    this.cdr.detectChanges();
  }

  trustHtml(content: any) {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}

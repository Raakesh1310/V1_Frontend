import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService, UtilityService } from '@common/services';
import { Account, AccountDescriptionInput } from '@modules/accounts/models';
import { AccountsAdminService } from '@modules/accounts/services/accountsAdmin.service';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import accountStatus from 'config/accountStatus';
import { BehaviorSubject, Observable } from 'rxjs';

import { AuthService } from '@modules/auth/services';
import merchantUserRoles from 'config/merchantUserRoles';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sbpro-all-accounts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './all-accounts.component.pug',
  styleUrls: ['all-accounts.component.scss']
})
export class AllAccountsComponent implements OnInit, OnDestroy {
  @Input() pageSize = 8;
  @Input() merchantId = '';
  model!: NgbDateStruct;
  account$!: Observable<Account[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  isSelected = false;
  selectedAccount: any = {};
  clearForm = false;
  statusList = Object.values(accountStatus);
  private _loadingList$ = new BehaviorSubject(false);
  filtersVisible = true;
  readOnly = false;
  modalRef?: NgbModalRef;
  @ViewChild('warningMessage', { static: true }) warningMessage?: ElementRef;
  @Output() emitMerchantId: EventEmitter<string> = new EventEmitter<string>();

  isTrustee = false;
  isMerchantAuthorizer = false;
  roles: string[] = [];
  isSuperAdminViewer = false;
  isAdmin = false;

  constructor(
    public authService: AuthService,
    public accountsService: AccountsAdminService,
    public changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private router: Router,
    private _location: Location,
    private calendar: NgbCalendar,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  toggleFilters() {
    console.log('toggling filters');
    this.filtersVisible = !this.filtersVisible;
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit() {
    // this.accountsService.performSearch();
    // this.accountsService.retrieveData();
    // this.accountsService.performSearch();
    this.accountsService.page = 1;
    this.accountsService.searchTerm = '';
    this.accountsService.pageSize = this.pageSize;
    this.account$ = this.accountsService.account$;
    this.total$ = this.accountsService.total$;
    this.accountsService.isAdmin = this.authService.isSuperAdmin();

    this.accountsService.account$.subscribe(() => {
      this._loadingList$.next(false);
    });

    this.checkForReadOnly();

    this.accountsService.dateFrom = new NgbDate(0, 0, 0);
    this.accountsService.dateTo = new NgbDate(0, 0, 0);

    this.loadData();
  }

  checkboxAction(checkbox: HTMLInputElement) {
    if (checkbox.checked) {
      this.accountsService.isAuto = true;
      this.accountsService.performSearch();
    } else {
      this.accountsService.isAuto = false;
      this.accountsService.performSearch();
    }
  }

  checkForReadOnly() {
    this.roles = this.authService.getRole();
    this.isSuperAdminViewer =
      this.roles?.indexOf(merchantUserRoles.SUPER_ADMIN_VIEWER) > -1
        ? true
        : false;
    this.isTrustee =
      this.roles?.indexOf(merchantUserRoles.TRUSTEE) > -1 ? true : false;
    this.isMerchantAuthorizer =
      this.roles?.indexOf(merchantUserRoles.MERCHANT_AUTHORIZER) > -1
        ? true
        : false;
    if (
      this.roles &&
      (this.isTrustee || this.isSuperAdminViewer || this.isMerchantAuthorizer)
    ) {
      this.readOnly = true;
    }
  }

  submitSearchForm() {
    this.clearForm = true;
    console.log('Submitting Search Form');

    // Reload the data
    this.loadData();
  }

  refreshData() {
    this._loadingList$.next(true);
    console.log('Loading data');
    this.accountsService.performRefresh();
  }

  /**
   * Update Retention Checkbox
   * @param event
   */
  updateIsAutoCheckBoxVal(event: Event) {
    this.accountsService.isAuto = (event.target as HTMLInputElement).checked
      ? true
      : false;
    this.loadData();
    this.cdr.detectChanges();
  }

  loadData() {
    this.accountsService.performReset();
    if (this.merchantId) {
      this.accountsService.merchantId = this.merchantId;
    }
    this.accountsService;
    this._loadingList$.next(true);
    console.log('Loading data');
    this.accountsService.performSearch();
  }

  clearSearchForm() {
    const dNow = new Date();

    this.clearForm = false;
    this.accountsService.searchTerm = '';
    this.accountsService.status = '';
    this.accountsService.bank = '';
    (this.accountsService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    )),
      (this.accountsService.dateTo = this.calendar.getNext(
        new NgbDate(0, 0, 0),
        'd',
        0
      )),
      this.accountsService.performSearch();
    this.accountsService.dateFromMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.accountsService.dateToMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.cdr.detectChanges();
  }

  toggle() {
    this.isSelected = !this.isSelected;
  }

  showDetails(acc: Account) {
    // console.log(user);
    // this.userService.userObject = user;
    // this.router.navigate(['/users', {}]);
    this.router.navigateByUrl(
      environment.urlPortalPrefix + '/escrow/escrow-details',
      {
        state: { account: acc, isUpdate: true }
      }
    );
  }

  // tslint:disable-next-line:no-any
  fetchDetails(account: any) {
    // let date = account.startDate
    //   ? new Date(account.startDate)
    //   : new Date(account.updatedAt);
    // account.startDate =
    //   date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    // this.selectedAccount = account;
    // const modalRef = this.modalService.open(CreateAccountComponent, {
    //   backdrop: 'static',
    //   size: 'lg'
    // });
    // modalRef.componentInstance.account = account;
    // modalRef.componentInstance.doClose = modalRef;
  }

  ngOnDestroy() {
    this.accountsService.performReset();
  }

  viewDetails(accountId: string, merchantId: string) {
    this.emitMerchantId.emit(merchantId);
    this.router.navigate([environment.urlAdminPrefix + '/escrow/' + accountId]);
  }

  goBack() {
    this._location.back();
  }

  /**
   * Format number according to Indian currency
   * @param number
   * @returns
   */
  public toINR(number: number) {
    return this.utilityService.toINR(number);
  }

  public checkActiveInactive(value: string): string {
    let time = new Date(value);
    let currentTime = new Date();
    if (
      currentTime.getTime() >= time.getTime() ||
      time.getDate() === currentTime.getDate()
    ) {
      return accountStatus.ACTIVE;
    } else {
      return accountStatus.INACIVE;
    }
  }

  openWarningModal(accountId: string) {
    this.modalRef = this.modalService.open(this.warningMessage, {
      backdrop: 'static'
    });
    this.modalRef.result.then(resp => {
      if (resp) {
        this.closeVEA(accountId);
      }
      this.modalRef?.close();
    });
  }

  public closeVEA(accountId: string) {
    let body = { status: 'Closed' };
    this.accountsService
      .update(accountId, body as AccountDescriptionInput, this.merchantId)
      .subscribe(
        resp => {
          if (resp.result) {
            this.loadData();
          }

          if (resp.errors) {
            console.log('ERROR WHILE CLOSING VEA');
            let toastHead = 'Error';
            let toastBody = '';
            // this.errors = ['Connection Error'];
            toastBody = resp.errors[0];

            this.showToast(toastHead, toastBody, {
              headerClasses: 'bg-danger text-white'
            });
            this.closeModal(true);
            this.cdr.detectChanges();
          }
        },
        err => {
          console.log('ERROR FROM API SIDE ', err);
          let toastHead = 'Error';
          let toastBody = '';
          if (err.status === 0) {
            // this.errors = ['Connection Error'];
            toastBody = 'Connection Error';
          } else {
            // this.errors = err.error.errors;
            toastBody = err.error.errors;
          }
          this.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.closeModal(true);
          this.cdr.detectChanges();
        }
      );
  }

  closeModal(acceptance: boolean) {
    this.modalRef?.close(acceptance);
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

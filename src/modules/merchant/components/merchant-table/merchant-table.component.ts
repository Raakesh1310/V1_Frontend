import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { OtpModalComponent } from '@common/components';
import { UtilityService } from '@common/services';
import banksTypes from '@modules/accounts/constants/banksTypes';
import { User } from '@modules/auth/models';
import { Merchant } from '@modules/auth/models/merchant.model';
import { AuthService } from '@modules/auth/services';
import { ApprovalsService } from '@modules/approvals/services';
import {
  MerchantAuhtorizerAuditDetailsInterface,
  MerchantAuthorizerAuditInterface
} from '@modules/merchant/models/merchant-authorizer-audit-report.model';
import { MerchantService } from '@modules/merchant/services';
import {
  NgbCalendar,
  NgbDate,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import merchantUserRoles from 'config/merchantUserRoles';
import smsMsg91TemplateId from 'config/smsMsg91TemplateId';
import { environment } from 'environments/environment';
import merchantEditApprovalValue from '@modules/approvals/constants/merchant-edit-approval-value';
import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'sbpro-merchant-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './merchant-table.component.pug',
  styleUrls: ['merchant-table.component.scss']
})
export class MerchantTableComponent implements OnInit {
  private _merchants$!: Observable<Merchant[]>;
  private _loadingList$ = new BehaviorSubject(false);
  private statusList = ['Active', 'Inactive'];
  filtersVisible = true;
  action = '';
  readOnly = false;
  _bankTypes: [string, string][] = [];
  errors: string[] = [];
  toastHead = '';
  toastBody = '';
  selectedMerchant: Merchant | undefined;
  isLoadingAuthorization = false;
  authorizers = [];
  maxLevel: number = 1;
  sortedApprovalKeys: Number[] = [];
  merchantEditApprovalValue = merchantEditApprovalValue;
  private isLoading = false;
  @Input() idfc!: boolean;

  modalRef?: NgbModalRef;
  @ViewChild('warningMessage', { static: true }) warningMessage?: ElementRef;

  isTrustee = false;
  isMerchantAuthorizer = false;
  roles: string[] = [];
  isSuperAdminViewer = false;

  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  get merchants$(): Observable<Merchant[]> {
    return this._merchants$;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['idfc']) {
      this.resetFilters();
      this.merchantService.idfcWhiteLabel = this.idfc;
      this.loadData();
    }
  }

  set merchants$(value: Observable<Merchant[]>) {
    this._merchants$ = value;
  }

  loadData() {
    if (this.isLoading) return;
    this.isLoading = true;
    this._loadingList$.next(true);
    this.merchantService.page = 1;
    this.merchantService.fetchData();
    banksTypes;
  }

  constructor(
    private merchantService: MerchantService,
    private utilityService: UtilityService,
    private router: Router,
    private calendar: NgbCalendar,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private authService: AuthService,
    private approvalsService: ApprovalsService
  ) {
    merchantService.merchants$.subscribe(() => {
      this._loadingList$.next(false);
      this.isLoading = false;
    });
    this.merchants$ = merchantService.merchants$;

    this.checkForReadOnly();

    this.merchantService.dateFrom = new NgbDate(0, 0, 0);
    this.merchantService.dateTo = new NgbDate(0, 0, 0);
    /**
     * Trigger the Network call
     * to fetch the merchant list
     */
    //* here IndusInd is patch work need to figure this out
    let tempBankTypes = JSON.parse(JSON.stringify(banksTypes));
    delete (tempBankTypes as any)['IBL'];
    this._bankTypes = _.toPairs({ ...tempBankTypes, IndusInd: 'ibl' });
    console.log(this._bankTypes);
    // this.loadData();
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

  toggleFilters() {
    this.filtersVisible = !this.filtersVisible;
  }

  clearForm() {
    console.log('clearing form');
    // tslint:disable-next-line:no-any
    this.merchantService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    // tslint:disable-next-line:no-any
    this.merchantService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.merchantService.page = 1;
    this.merchantService.pageSize = 10;
    this.merchantService.searchTerm = '';
    this.merchantService.status = '';
    this.merchantService.linkedBank = '';
    this.loadData();
    let dNow = new Date();
    this.merchantService.dateFromMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.merchantService.dateToMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.cdr.detectChanges();
  }

  public getFullName(user: User) {
    if (!user) {
      return '--';
    }
    return this.utilityService.getFullName(user.firstName, user.lastName);
  }

  // openWarningModal(merchant: Merchant, action: string) {
  //   this.action = action;
  //   this.modalRef = this.modalService.open(this.warningMessage, {
  //     backdrop: 'static',
  //     size: 'lg'
  //   });
  //   this.modalRef.result.then(resp => {
  //     if (resp) {
  //       this.performMerchantAction(merchant, this.action);
  //     }
  //     this.modalRef?.close();
  //   });
  // }

  sendOTP(merchant: Merchant, action: string) {
    this.action = action;
    // open OTP verification modal
    console.log('opening modal');
    const modalRef: NgbModalRef & {
      componentInstance: OtpModalComponent;
    } = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.doClose = modalRef;
    modalRef.componentInstance.header = action + ' Merchant';
    modalRef.componentInstance.mobile = environment.superAdminMobile;
    modalRef.componentInstance.merchantName = merchant.title;
    modalRef.componentInstance.templateId =
      action === 'Activate'
        ? smsMsg91TemplateId.merchantActivateOtp
        : smsMsg91TemplateId.merchantDeactivateOtp;

    modalRef.componentInstance.passOtp.subscribe((otp: number) => {
      if (otp) {
        this.performMerchantAction(merchant, this.action, otp.toString());
      } else {
        console.log('something went with modal');
      }
    });
  }

  public performMerchantAction(
    merchant: Merchant,
    action: string,
    otp: string
  ) {
    switch (action) {
      case 'Activate':
        this.merchantService
          .activate(merchant.merchantId, otp)
          .subscribe(resp => {
            if (resp.success) {
              this.merchantService.fetchData();
            } else {
              this.toastBody = resp.message;
              this.toastHead = 'Merchant Activation Failed';
              this.utilityService.showToast(this.toastHead, this.toastBody, {
                headerClasses: 'bg-danger text-white'
              });
            }
          });
        break;
      case 'Deactivate':
        this.merchantService
          .deactivate(merchant.merchantId, otp)
          .subscribe(resp => {
            if (resp.result) {
              this.merchantService.fetchData();
            }
          });
        break;
    }
  }

  ngOnInit() { }

  openDetails(merchantId: string) {
    this.router.navigate([
      environment.urlAdminPrefix + '/merchant/' + merchantId
    ]);
  }
  closeModal(acceptance: boolean) {
    this.modalRef?.close(acceptance);
  }

  openMap(modal: HTMLTemplateElement) {
    console.log('SELECTED MERCHANT ', this.selectedMerchant);
    if (!this.selectedMerchant) {
      return;
    }
    const url =
      environment.apiPrefix +
      `/super-admin/merchant/approvals`;
    this.isLoadingAuthorization = true;

    this.cdr.detectChanges();
    this.approvalsService.getMerchantApprovalData(url, {}, this.selectedMerchant?.merchantId).subscribe(
      (resp: any) => {
        console.log('RESP ', resp);
        if (resp.success) {
          (this.selectedMerchant as Merchant).authorizations = resp.result;
        }
        this.mapAuthorizations();
        this.isLoadingAuthorization = false;
        this.cdr.detectChanges();
        this.modalRef = this.modalService.open(modal, {
          backdrop: 'static'
        });
      },
      (err: any) => {
        this.isLoadingAuthorization = false;
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
        } else {
          console.log(err.error.errors);
          this.errors.push(err.error.errors);
          this.errors = err.error.errors;
        }
        this.cdr.detectChanges();
      }
    );
  }

  mapAuthorizations() {
    if (!this.selectedMerchant) {
      return;
    }

    const selectedMerchant = this.selectedMerchant as Merchant;
    const merchantAuthorizations = selectedMerchant.authorizations
      ? selectedMerchant.authorizations
      : null;

    if (merchantAuthorizations && merchantAuthorizations.length > 0) {
      let approvals: any = {
        merchant: {} as MerchantAuhtorizerAuditDetailsInterface
      };
      for (let merchantAuthorization of merchantAuthorizations) {
        if (
          !merchantAuthorization.level &&
          (merchantAuthorization.type === 'merchantAuthInitiate' || merchantAuthorization.type === 'merchantAuthUpdate')
        ) {
          approvals['merchant'][merchantAuthorization.totalLevel] = {
            authorizers: [merchantAuthorization],
          };
          if (merchantAuthorization.type === 'merchantAuthInitiate') approvals['merchant'][merchantAuthorization.totalLevel]['isCreator'] = true;
          if (merchantAuthorization.type === 'merchantAuthUpdate') approvals['merchant'][merchantAuthorization.totalLevel]['isEditor'] = true;
        } else {
          if (
            !(`${merchantAuthorization.totalLevel}` in approvals['merchant'])
          ) {
            approvals['merchant'][merchantAuthorization.totalLevel] = {
              authorizers: [merchantAuthorization],
              minApprovalsNeeded: merchantAuthorization.approvalsRequired,
              isApproved: false,
              level: merchantAuthorization.level,
              isCurrent: merchantAuthorization.isCurrent ? true : false
            };
          } else {
            approvals['merchant'][merchantAuthorization.totalLevel]['authorizers'].push(merchantAuthorization);
          }
        }
      }

      for (let approval_type in approvals) {
        for (let level in approvals[approval_type]) {
          // Level wise details
          let totalApproved = 0;
          for (let auth of approvals[approval_type][level].authorizers) {
            totalApproved += auth.approved ? 1 : 0;
            // Handle Rejected
            if (auth.verified && !auth.approved) {
              approvals[approval_type][level].isRejected = true;
            }
          }
          approvals[approval_type][level].isApproved =
            totalApproved >= approvals[approval_type][level].minApprovalsNeeded;

          approvals[approval_type][level].authorizers.sort((a: any, b: any) => {
            return new Date(a.verifiedAt) > new Date(b.verifiedAt) ? 1 : -1;
          });
        }
      }
      // Sort for more than 10 levels
      this.sortedApprovalKeys = Object.keys(approvals['merchant']).map(Number);
      this.authorizers = approvals;
      console.log(approvals);
      console.log(this.sortedApprovalKeys);
      this.maxLevel = Object.keys(approvals['merchant']).length;
    } else {
      // Authorization length is zero than set authorizers to 0
      this.authorizers = [];
    }
    this.cdr.detectChanges();
  }

  getMaxLevel() {
    console.log(this.maxLevel);
    return this.maxLevel;
  }

  /**
   * Format number according to Indian currency
   * @param number
   * @returns
   */
  public toINR(number: number) {
    return this.utilityService.toINR(number);
  }

  resetFilters() {
    this.merchantService.status = '';
    this.merchantService.linkedBank = '';
    this.merchantService.isCarLoan = '';
  }
}

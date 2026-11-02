import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AccountDescriptionDetail,
  AccountPayeeDraft
} from '@modules/accounts/models';
import { AuthService } from '@modules/auth/services';
import { ProfileService } from '@modules/profile/services';
import { UtilityService } from '@common/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import banksTypes from '@modules/accounts/constants/banksTypes';
import autoTransferType from '@modules/accounts/constants/autoTransferType';

@Component({
  selector: 'sbpro-accounts-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accounts-form-page.component.pug',
  styleUrls: ['accounts-form-page.component.scss']
})
export class AccountsFormPageComponent implements OnInit {
  allTabs: string[] = [];
  disabledTabs: string[] = [];
  currentTab = 0;
  accountId = '';
  isAutoTransfer = false;
  draftPayees: AccountPayeeDraft[];
  draftShareUnit = '%';
  modalRef?: NgbModalRef;
  merchantId: string = '';
  isAdmin = false;
  isPaymentGateway = false;
  isAccountAddAllowed = true;
  paymentAmount = 0;
  merchantDetails = {
    id: '',
    merchantName: '',
    merchantEmail: '',
    merchantPhone: ''
  };
  toastHead = '';
  toastBody = '';
  retention = false;
  retentionAmount = 0;
  selectedBank!: string;
  sourceAccountValidation: boolean = false;
  cacheForm: boolean = false;

  @ViewChild('infoMessage', { static: true }) infoMessage?: ElementRef;
  @ViewChild('rejectMessage', { static: true }) rejectMessage?: ElementRef;

  private _loading$ = new BehaviorSubject(false);

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  /**
   * Form Cache
   */
  cachedDescription?: AccountDescriptionDetail;

  autoTransferType: string = autoTransferType.INSTANT;
  autoScheduledAt: string = '9am';

  constructor(
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
    private utilityService: UtilityService,
    private route: ActivatedRoute
  ) {
    this.draftPayees = [];
    this.isAdmin = this.authService.isSuperAdmin();
    this.checkProfileDetails();
  }

  ngOnInit() {
    if (!this.isAdmin) {
      if (this.route.snapshot.queryParamMap.get('paymentReceived')) {
        if (
          this.route.snapshot.queryParamMap.get('paymentReceived') === 'false'
        ) {
          this.paymentError();
        }
      } else {
        setTimeout(() => {
          this.modalRef = this.modalService.open(this.infoMessage, {
            backdrop: 'static',
            size: 'lg'
          });
        }, 600);
      }
    }
  }

  checkProfileDetails() {
    this._loading$.next(true);
    this.profileService.getProfile(this.merchantId, false).subscribe(
      resp => {
        this._loading$.next(false);
        if (
          resp.result.feeDetails &&
          resp.result.feeDetails.isPaymentGateway &&
          resp.result.feeDetails.virtualAccount.feeSetting ===
            'pay-as-you-go' &&
          !resp.result.isAccountCredited
        ) {
          //Get Details for Payment
          this.isPaymentGateway = true;
          this.paymentAmount = resp.result.feeDetails.virtualAccount.feeAmount;
          this.merchantDetails.merchantName =
            resp.result.firstName + ' ' + resp.result.lastName;
          this.merchantDetails.merchantEmail = resp.result.email;
          this.merchantDetails.merchantPhone = resp.result.mobile.toString();
          this.merchantDetails.id = resp.result.merchantId;
        }
        //Check if Add Account Allowed
        this.isAccountAddAllowed = resp.result.isAccountAddAllowed;

        this.sourceAccountValidation = resp.result.sourceAccountValidation;

        this.cdr.detectChanges();
      },
      err => {
        console.error(err);
      }
    );
  }

  ngAfterViewChecked() {
    if (!this.isAccountAddAllowed) {
      this.modalRef?.close();
      this.modalRef = this.modalService.open(this.rejectMessage, {
        backdrop: 'static',
        size: 'lg'
      });
    }
  }

  closeModal() {
    this.modalRef?.close();
  }

  paymentError() {
    this.toastBody = 'Payment could not be processed';
    this.toastHead = 'Error';
    this.utilityService.showToast(this.toastHead, this.toastBody, {
      headerClasses: 'bg-danger text-white'
    });
    this.cdr.detectChanges();
  }

  /**
   * redirect to payee page
   */
  redirectToPayee() {
    this.closeModal();
    this.router.navigate([`${environment.urlPortalPrefix}/payee/form`]);
  }

  /**
   * redirect to previous
   * page
   */
  redirectToAccount() {
    this.closeModal();
    this.router.navigate([environment.urlPortalPrefix + '/escrow']);
  }

  /**
   * cache description
   * and enable next view
   * @param accountDescription
   */
  cacheAccountDescription(accountDescription: AccountDescriptionDetail) {
    this.accountId = accountDescription.accountId;
    this.cachedDescription = accountDescription;
    this.cacheForm = true;
    this.cdr.detectChanges();
  }

  setdraftPayees(payee: AccountPayeeDraft) {
    if (!payee) {
      this.draftPayees = [];
      this.cdr.detectChanges();
      return;
    }
    this.draftPayees.push(payee);
    this.cdr.detectChanges();
  }

  unsetdraftPayees(payee: string) {
    this.draftPayees.splice(
      this.draftPayees.findIndex(function(i) {
        return i.accountPayeeId === payee;
      }),
      1
    );
    this.cdr.detectChanges();
  }

  setRetention(checked: boolean) {
    this.retention = checked;
    this.cdr.detectChanges();
  }

  setRetentionAmount(amount: number) {
    this.retentionAmount = amount;
    this.cdr.detectChanges();
  }

  toggleAutoTransfer(isAuto: boolean) {
    this.isAutoTransfer = isAuto;
    this.cdr.detectChanges();
  }

  setAutoTransferType(autoTransferType: string) {
    this.autoTransferType = autoTransferType;
    this.cdr.detectChanges();
  }

  setScheduledAt(autoScheduledAt: string) {
    this.autoScheduledAt = autoScheduledAt;
    this.cdr.detectChanges();
  }

  setDraftShareUnit(unit: string) {
    this.draftShareUnit = unit;
    this.cdr.detectChanges();
  }

  nextTab($event: boolean) {
    if (this.disabledTabs.length > 0) {
      this.disabledTabs.shift();
    }
    this.currentTab += 1;
    this.cdr.detectChanges();
  }

  setCurrentTab($event: number) {
    this.currentTab = $event;
    this.cdr.detectChanges();
  }

  setMerchantId(merchantId: string) {
    this.merchantId = merchantId;
    this.cdr.detectChanges();
  }

  setSelectedBank(bank: string) {
    this.selectedBank = bank;
    this.setNavNames();
    this.cdr.detectChanges();
  }

  isSAValid(bank: string) {
    if (bank === banksTypes.ICICI || bank === banksTypes.IDFC) {
      return true;
    }
    return false;
  }

  setNavNames() {
    this.profileService.getProfile(this.merchantId, false).subscribe(resp => {
      this.sourceAccountValidation = resp.result.sourceAccountValidation;
      if (
        this.isSAValid(this.selectedBank) &&
        this.sourceAccountValidation
      ) {
        // this.allTabs = [];
        // this.disabledTabs = [];
        this.allTabs = [
          'Description',
          'Link Payee',
          'Source Account',
          'Documents'
        ];
        if (this.disabledTabs.length === 2) {
          this.disabledTabs = ['Source Account', 'Documents'];
        }
        this.disabledTabs =
          this.disabledTabs.length > 0
            ? this.disabledTabs
            : this.cacheForm
            ? this.disabledTabs
            : ['Link Payee', 'Source Account', 'Documents'];
      } else {
        // this.allTabs = [];
        // this.disabledTabs = [];
        const index = this.disabledTabs.indexOf('Source Account');
        if (index !== -1) {
          this.disabledTabs.splice(index, 1);
        }
        this.allTabs = ['Description', 'Link Payee', 'Documents'];
        this.disabledTabs =
          this.disabledTabs.length > 0
            ? this.disabledTabs
            : this.cacheForm
            ? this.disabledTabs
            : ['Link Payee', 'Documents'];
      }
      this.cdr.detectChanges();
    });
  }
}

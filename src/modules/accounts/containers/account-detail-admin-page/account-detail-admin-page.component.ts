import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountPayeeDraft } from '@modules/accounts/models';
import { AuthService } from '@modules/auth/services';
import merchantUserRoles from 'config/merchantUserRoles';

import { environment } from '../../../../environments/environment';
import { ProfileService } from '@modules/profile/services';
import banksTypes from '@modules/accounts/constants/banksTypes';

@Component({
  selector: 'sbpro-account-detail-admin-page',
  templateUrl: './account-detail-admin-page.component.pug',
  styleUrls: ['./account-detail-admin-page.component.scss']
})
export class AccountDetailAdminPageComponent implements OnInit {
  accountId = '';
  link: string | undefined;
  uploadLink: string | undefined;
  draftPayees: AccountPayeeDraft[] = [];
  draftShareUnit = '%';
  merchantId: string = '';
  readOnly = false;
  isAutoTransfer = false;
  selectedBank = '';
  navNames: string[] = [];
  depositTabAccess = false;
  isSuperAdminViewer = false;
  isMerchantAuthorizer = false;
  isTrustee = false;
  roles: string[] = [];
  sourceAccountValidation: boolean = false;

  autoTransferType!: boolean;
  autoScheduledAt!: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    this.activatedRoute.paramMap.subscribe(resp => {
      try {
        if (!resp.get('accountId') || resp.get('accountId') === '') {
          this.goBack();
        }
        this.accountId = resp.get('accountId') || '';
        this.link = `super-admin/account/${this.accountId}/agreement`;
        this.uploadLink = `/super-admin/account/${this.accountId}/upload`;
      } catch (e) {
        console.error(e);
      }
    });
    console.log(this.accountId);
    this.checkForReadOnly();
  }

  checkForReadOnly() {
    this.roles = this.authService.getRole();
    this.depositTabAccess = this.authService.getDepositAccess();
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

  getTabNames(roles: string[]) {
    if (roles) {
      if (this.isTrustee || this.isMerchantAuthorizer) {
        this.navNames = [
          'Escrow',
          'Document',
          'Linked payee',
          'Authorizers',
          'Statements'
        ];
      } else if (this.isSuperAdminViewer) {
        this.navNames = [
          'Escrow',
          'Agreements',
          'Document',
          'Linked payee',
          'Authorizers',
          'Statements'
        ];
      } else {
        this.navNames = [
          'Escrow',
          'Agreements',
          'Document',
          'Linked payee',
          'Funds Blocking',
          'Authorizers',
          'Settings',
          'Statements',
          'Deposit',
          'Activity Logs',
          'Escrow Fees'
        ];
      }
      this.cdr.detectChanges();
    }
  }

  setDraftShareUnit(unit: string) {
    console.log('setting parent share unit --==>>>', unit);
    this.draftShareUnit = unit;
    this.cdr.detectChanges();
  }

  setMerchantId(merchantId: string) {
    console.log('merchantId --==>>>', merchantId);

    this.merchantId = merchantId;
    this.setNavNames();
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.getTabNames(this.roles);
  }

  toggleAutoTransfer(isAutoTransfer: boolean) {
    this.isAutoTransfer = isAutoTransfer;
    console.log('toggling auto transfer to -----> ', isAutoTransfer);
  }

  setAutoTransferType(autoTransferType: boolean) {
    this.autoTransferType = autoTransferType;
    console.log('auto transfer type -----> ', autoTransferType);
  }

  setScheduledAt(autoScheduledAt: boolean) {
    this.autoScheduledAt = autoScheduledAt;
    console.log('auto transfer scheduled at -----> ', autoScheduledAt);
  }

  setdraftPayees(payee: AccountPayeeDraft) {
    if (!payee) {
      this.draftPayees = [];
      this.cdr.detectChanges();
      return;
    }
    this.draftPayees.push(payee);
    this.cdr.detectChanges();
    console.log('drafts in parent ---===>>>', this.draftPayees);
  }

  unsetdraftPayees(payee: string) {
    this.draftPayees.splice(
      this.draftPayees.findIndex(function(i) {
        return i.accountPayeeId === payee;
      }),
      1
    );
    this.cdr.detectChanges();
    console.log('drafts in parent ---===>>>', this.draftPayees);
  }

  goBack() {
    this.router.navigate([environment.urlAdminPrefix + '/escrow']);
  }

  setSelectedBank(bank: string) {
    this.selectedBank = bank;
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
      if (this.isTrustee || this.isMerchantAuthorizer) {
        this.navNames = [
          'Escrow',
          'Document',
          'Linked payee',
          'Authorizers',
          'Statements'
        ];
      } else if (
        this.isSuperAdminViewer &&
        this.isSAValid(this.selectedBank) &&
        this.sourceAccountValidation
      ) {
        this.navNames = [
          'Escrow',
          'Agreements',
          'Document',
          'Linked payee',
          'Authorizers',
          'Statements',
          'Source Account'
        ];

        if (this.depositTabAccess) {
          this.navNames.push('Deposit');
        }
      } else if (this.isSuperAdminViewer) {
        this.navNames = [
          'Escrow',
          'Agreements',
          'Document',
          'Linked payee',
          'Authorizers',
          'Statements'
        ];

        if (this.depositTabAccess) {
          this.navNames.push('Deposit');
        }
      } else if (
        !this.isSuperAdminViewer &&
        this.isSAValid(this.selectedBank) &&
        this.sourceAccountValidation
      ) {
        this.navNames = [
          'Escrow',
          'Agreements',
          'Document',
          'Linked payee',
          'Funds Blocking',
          'Authorizers',
          'Settings',
          'Statements',
          'Deposit',
          'Activity Logs',
          'Escrow Fees',
          'Source Account'
        ];
      } else {
        this.navNames = [
          'Escrow',
          'Agreements',
          'Document',
          'Linked payee',
          'Funds Blocking',
          'Authorizers',
          'Settings',
          'Statements',
          'Deposit',
          'Activity Logs',
          'Escrow Fees'
        ];
      }
      this.cdr.detectChanges();
    });
  }
}

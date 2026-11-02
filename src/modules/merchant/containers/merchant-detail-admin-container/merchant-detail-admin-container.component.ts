import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AllAccountsComponent } from '@modules/accounts/components';
import merchantEditAuthorizationTypes from '@modules/approvals/constants/merchant-edit-authorization-types';
import { merchantApprovalModel } from '@modules/approvals/models';
import { ApprovalsService } from '@modules/approvals/services';
import { AuthService } from '@modules/auth/services';
import { ProfileService } from '@modules/profile/services';
import merchantUserRoles from 'config/merchantUserRoles';
import { environment } from 'environments/environment';

@Component({
  selector: 'sbpro-merchant-detail-admin-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './merchant-detail-admin-container.component.pug',
  styleUrls: ['merchant-detail-admin-container.component.scss']
})
export class MerchantDetailAdminContainerComponent implements OnInit {
  merchantId = '';
  readOnly = false;
  businessType = '';
  merchantName = '';
  roles: string[] = [];
  isMerchantAuthorizer = false;
  isTrustee = false;
  isSuperAdminViewer = false;
  @ViewChild(AllAccountsComponent) child?: AllAccountsComponent;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private profileService: ProfileService,
    private approvalsService: ApprovalsService
  ) {
    this.activatedRoute.paramMap.subscribe(resp => {
      try {
        if (!resp.get('merchantId') || resp.get('merchantId') === '') {
          this.goBack();
        }
        this.merchantId = resp.get('merchantId') || '';
      } catch (e) {
        console.error(e);
        this.goBack();
      }
    });
    console.log(this.merchantId);
    this.checkForReadOnly();
  }

  ngOnInit() {
    if (this.merchantId) {
      this.profileService.getProfile(this.merchantId, false).subscribe(resp => {
        if (resp?.result?.businessType) {
          this.businessType = resp.result.businessType;
        }
      });
    }
  }

  highlightUpdatedTabs() {
    const url =
      environment.apiPrefix +
      `/super-admin/merchant/approvals`;
    // Check for active approvals and highlight
    this.approvalsService.getMerchantApprovalData(url, {}, this.merchantId).subscribe(
      (resp: any) => {
        console.log('RESP ', resp.result);
        const merchantAuthorizations: merchantApprovalModel[] = resp.result;
        let i = 0;
        for (const merchantAuthorization of merchantAuthorizations) {
          if (merchantAuthorization?.active === true) {
            switch (merchantAuthorization.details) {
              case merchantEditAuthorizationTypes.BASIC_DETAILS: { 
                i = 2; 
                break;
              }
              case merchantEditAuthorizationTypes.BUSINESS_PROFILE: { 
                i = 3; 
                break;
              }
              case merchantEditAuthorizationTypes.ESCROW_PARTIES: { 
                i = 8; 
                break;
              }
              case merchantEditAuthorizationTypes.ADD_PARTIES: { 
                i = 8; 
                break;
              }
              case merchantEditAuthorizationTypes.ADD_PAYEES: { 
                i = 7; 
                break;
              }
              case merchantEditAuthorizationTypes.ADD_BANK_ACCOUNTS: { 
                i = 6; 
                break;
              }
            }
            // Highlight Updated Tab
            let tabToHighlight = document.querySelectorAll('li.nav-item')[i];
            if (tabToHighlight) {
              let aTag = (tabToHighlight as HTMLElement).querySelector('a');
              if (aTag) aTag.style.backgroundColor = 'yellow'; 
            }
            return;
          }
        }
      },
      (err: any) => {
        if (err.status === 0) {
          console.log('Connection Error');
        } else {
          console.log(err.error.errors);
        }
        this.cdr.detectChanges();
      }
    );
  }

  getTabNames(roles: string[]) {
    if (roles) {
      if (this.isTrustee || this.isMerchantAuthorizer) {
        if (this.isMerchantAuthorizer) this.highlightUpdatedTabs();
        return [
          'Basic Details',
          'Business profile',
          'Documents',
          'Escrows',
          'Bank Accounts',
          'Payees',
          'Escrow Parties',
          'Team Members',
          'Authorizer'
        ];
      } else if (this.isSuperAdminViewer) {
        return [
          'Basic Details',
          'Business profile',
          'Documents',
          'Bank details',
          'Escrows',
          'Bank Accounts',
          'Payees',
          'Escrow Parties',
          'Team Members',
          'Fees',
          'Invoice',
          'Authorizer'
        ];
      }

      return [
        'Basic Details',
        'Business profile',
        'Documents',
        'Bank details',
        'Escrows',
        'Bank Accounts',
        'Payees',
        'Escrow Parties',
        'Team Members',
        'Fees',
        'Invoice',
        'Authorizer',
        'Settings'
      ];
    }
  }

  getTabs(roles: string) {
    // return !this.readOnly
    //   ? '[basic, profile, doc, Bank, Accounts, Payees, Team, fees, invoices, Settings]'
    //   : '[basic, profile, doc, Accounts, Payees, Team]';
    if (roles) {
      if (this.roles?.indexOf(merchantUserRoles.TRUSTEE) > -1) {
        return '[basic, profile, doc, Accounts, Payees, Team]';
      } else if (
        this.roles?.indexOf(merchantUserRoles.SUPER_ADMIN_VIEWER) > -1
      ) {
        return '[basic, profile, doc, Bank, Accounts, Payees, Team, fees, invoices, authorizer]';
      }
      return '[basic, profile, doc, Bank, Accounts, Payees, Team, fees, invoices, authorizer, Settings]';
    }
  }

  checkForReadOnly() {
    this.roles = this.authService.getRole();

    this.isTrustee =
      this.roles?.indexOf(merchantUserRoles.TRUSTEE) > -1 ? true : false;

    this.isMerchantAuthorizer =
      this.roles?.indexOf(merchantUserRoles.MERCHANT_AUTHORIZER) > -1
        ? true
        : false;

    this.isSuperAdminViewer =
      this.roles?.indexOf(merchantUserRoles.SUPER_ADMIN_VIEWER) > -1
        ? true
        : false;
    if (
      this.roles &&
      (this.isTrustee || this.isSuperAdminViewer || this.isMerchantAuthorizer)
    ) {
      this.readOnly = true;
    }
  }

  setBusinessType(businessType: string) {
    this.businessType = businessType;
    this.cdr.detectChanges();
  }

  setMerchantName(merchantName: string) {
    this.merchantName = merchantName;
    this.cdr.detectChanges();
  }

  setMerchantId(merchantId: string) {
    this.merchantId = merchantId;
    this.cdr.detectChanges();
  }

  refresh($event: boolean) {
    if ($event) {
      console.log('refreshing in parent');
      this.child?.refreshData();
    }
  }

  toggle($event: boolean) {
    if ($event) {
      console.log('toggling in parent');
      this.child?.toggleFilters();
    }
  }

  goBack() {
    this.router.navigate([environment.urlAdminPrefix + '/merchant']);
  }
}

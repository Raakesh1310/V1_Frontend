import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import banksTypes from '@modules/accounts/constants/banksTypes';
import { AuthService } from '@modules/auth/services';
import { DashboardService } from '@modules/dashboard/services/dashboard.service';
import { getAccessFeatures } from '@modules/navigation/components/top-nav-merchant/team-access';
import { ProfileService } from '@modules/profile/services';
import merchantUserRoles from 'config/merchantUserRoles';
import { forEach } from 'lodash';

import { environment } from '../../../../environments/environment';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { timer } from 'rxjs';

@Component({
  selector: 'sbpro-dashboard-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-overview.component.pug',
  styleUrls: ['dashboard-overview.component.scss']
})
export class DashboardOverviewComponent implements OnInit {
  // init for card data
  @Input() cb!: boolean;
  merchantProfile?: MerchantProfile | null;
  invites = [];
  isOwner = true;
  isMerchantVerified: boolean;
  isAdmin = false;
  connectedBanking = false;
  banks: string[] = [];
  navNames: string[] = [];

  @ViewChild('all')
  all: TemplateRef<any> | undefined;
  @ViewChild('icici')
  icici: TemplateRef<any> | undefined;
  @ViewChild('rbl')
  rbl: TemplateRef<any> | undefined;
  @ViewChild('yes')
  yes: TemplateRef<any> | undefined;
  @ViewChild('idfc')
  idfc: TemplateRef<any> | undefined;
  @ViewChild('ibl')
  ibl: TemplateRef<any> | undefined;
  @ViewChild('hdfc') hdfc: TemplateRef<any> | undefined;
  @ViewChild('dbs') dbs: TemplateRef<any> | undefined;
  @ViewChild('axis') axis: TemplateRef<any> | undefined;
  templateRefs: any = [];

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
    this.isMerchantVerified = this.authService.isMerchantVerified();
  }

  async ngOnInit() {
    const roles = this.authService.getRole();

    if (roles && roles.indexOf(merchantUserRoles.MERCHANT_AUTHORIZER) > -1) {
      this.router.navigate([environment.urlPortalPrefix + '/approvals']);
    }

    if (
      !this.isAdmin &&
      roles &&
      (roles.indexOf(merchantUserRoles.AUTHORIZER) > -1 ||
        roles.indexOf(merchantUserRoles.ACCOUNT_AUTHORIZER) > -1) &&
      roles.indexOf(merchantUserRoles.OWNER) === -1
    ) {
      this.router.navigate([environment.urlPortalPrefix + '/approvals']);
    }

    if (roles && roles.indexOf(merchantUserRoles.PAYEE) > -1) {
      this.router.navigate([environment.urlPortalPrefix + '/escrow']);
    }

    if (roles && roles.indexOf(merchantUserRoles.TRUSTEE) > -1) {
      this.router.navigate([environment.urlAdminPrefix + '/approvals']);
    }

    if (roles && roles.indexOf(merchantUserRoles.CUSTOM) > -1) {
      const merchantUserAccess = this.authService.getAccess();
      const accessObject = getAccessFeatures(merchantUserAccess);
      let redirectionUrl = '';
      if (accessObject.accountList) {
        redirectionUrl = '/escrow';
      } else if (accessObject.addPayee) {
        redirectionUrl = '/payee';
      } else if (accessObject.payeeList) {
        redirectionUrl = '/payee/form';
      } else if (accessObject.createTransfer) {
        redirectionUrl = '/transfer';
      } else if (accessObject.createTransfer) {
        redirectionUrl = '/transaction';
      } else if (accessObject.escrowPages) {
        redirectionUrl = '/escrow-page';
      } else if (accessObject.challans) {
        redirectionUrl = '/challan';
      }
      this.router.navigate([environment.urlPortalPrefix + redirectionUrl]);
    }

    this.isOwner = this.authService.isOwner();
    // this.dashboardService.fetchDashboardData();
    this.dashboardService.fetchInvites().subscribe((resp: any) => {
      this.invites = resp.result;
      // console.log(resp.result[0]);
      this.cdr.detectChanges();
    });

    this.merchantProfile = this.authService.getMerchantProfile();
    timer(environment.effectiveBalanceDelay).subscribe(() => {
      if (this.merchantProfile) {
        if (this.merchantProfile.banks?.length > 1) {
          this.banks.push('All');
          this.navNames = ['All Banks'];
          this.templateRefs = [this.all];
        } else {
          this.navNames = [];
        }
  
        forEach(this.merchantProfile.banks, bank => {
          this.banks.push(bank.bankName.toUpperCase());
          if (bank.bankName === banksTypes.YES_BANK) {
            this.navNames.push('YES');
          } else {
            this.navNames.push(bank.bankName.toUpperCase());
          }
          switch (bank.bankName) {
            case banksTypes.RBL: {
              this.templateRefs.push(this.rbl);
              break;
            }
            case banksTypes.ICICI: {
              this.templateRefs.push(this.icici);
              break;
            }
            case banksTypes.YES_BANK: {
              this.templateRefs.push(this.yes);
              break;
            }
            case banksTypes.IDFC: {
              this.templateRefs.push(this.idfc);
              break;
            }
            case banksTypes.HDFC: {
              this.templateRefs.push(this.hdfc);
              break;
            }
            case banksTypes.IBL: {
              this.templateRefs.push(this.ibl);
              break;
            }
            case banksTypes.DBS: {
              this.templateRefs.push(this.dbs);
              break;
            }
            case banksTypes.AXIS: {
              this.templateRefs.push(this.axis);
              break;
            }
            default: {
              break;
            }
          }
        });
        if (this.merchantProfile.isAccountAddAllowed || this.merchantProfile.connectedBanking) {
          this.connectedBanking = this.cb
            ? this.cb
            : this.merchantProfile.connectedBanking;
        }
        this.cdr.detectChanges();
      }
    });
  }

  cancelInvite(invite: string) {
    console.log('cancelling invite...');
    this.dashboardService.cancelInvite(invite).subscribe(resp => {
      location.reload();
    });
  }

  acceptInvite(invite: string) {
    console.log('Accepting invite...');
    this.dashboardService.acceptInvite(invite).subscribe(resp => {
      location.reload();
    });
  }

  redirectKYC() {
    this.router.navigate([environment.urlPortalPrefix + '/profile']);
  }

  isConnectedBanking() {
    return !this.isAdmin && this.connectedBanking;
  }
}

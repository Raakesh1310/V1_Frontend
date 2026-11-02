import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  Input
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountPayeeDraft } from '@modules/accounts/models';
import { AuthService } from '@modules/auth/services';
import merchantUserRoles from 'config/merchantUserRoles';
import { environment } from 'environments/environment';
import { RoleAccessPoint } from '../../../profile/models/roleAccess.model';
import banksTypes from '@modules/accounts/constants/banksTypes';

@Component({
  selector: 'sbpro-account-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-details-page.component.pug',
  styleUrls: ['account-details-page.component.scss']
})
export class AccountDetailsPageComponent implements OnInit {
  accountId: string = '';
  public merchantId: string = '';
  draftPayees: AccountPayeeDraft[] = [];
  draftShareUnit = '%';
  @Input() readOnly = false;
  retention = false;
  retentionAmount = 0;
  isAutoTransfer = false;
  navNames = ['Escrow Details', 'Linked payee', 'Document', 'Statements'];
  isTesting = false;
  selectedBank!: string;
  sourceAccountValidation: boolean = false;

  autoTransferType!: boolean;
  autoScheduledAt!: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.activatedRoute.paramMap.subscribe(resp => {
      try {
        if (!resp.get('accountId') || resp.get('accountId') === '') {
          this.goBack();
        }
        this.accountId = resp.get('accountId') || '';
      } catch (e) {
        console.error(e);
      }
    });
    let merchantProfile = this.authService.getMerchantProfile();
    this.sourceAccountValidation = merchantProfile?.sourceAccountValidation
      ? true
      : false;
    this.isTesting = merchantProfile?.enableTesting
      ? merchantProfile?.enableTesting
      : false;
    this.navNames = !this.isTesting
      ? ['Escrow Details', 'Linked payee', 'Document', 'Statements']
      : ['Escrow Details', 'Linked payee', 'Document', 'Statements', 'Deposit'];
    console.log(this.accountId);
    this.checkForReadOnly();
  }

  checkForReadOnly() {
    let roles = this.authService.getRole();
    // if (roles && roles?.indexOf(merchantUserRoles.TRUSTEE) > -1) {
    //   this.readOnly = true;
    // }
    if (roles && roles?.indexOf(merchantUserRoles.PAYEE) > -1) {
      this.readOnly = true;
    }
    if (roles && roles?.indexOf(merchantUserRoles.CUSTOM) > -1) {
      let accesses = this.authService.getAccess() as RoleAccessPoint;
      if (accesses.accounts && !accesses.accounts.includes('Add Account')) {
        this.readOnly = true;
      }
    }
    console.log(this.readOnly);
  }

  setDraftShareUnit(unit: string) {
    console.log('setting parent share unit --==>>>', unit);
    this.draftShareUnit = unit;
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    console.log('IN ACCOUNT Form');
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

  toggleAutoTransfer(isAuto: boolean) {
    this.isAutoTransfer = isAuto;
    console.log('toggling auto transfer to -----> ', isAuto);
  }

  setAutoTransferType(autoTransferType: boolean) {
    this.autoTransferType = autoTransferType;
    console.log('auto transfer type -----> ', autoTransferType);
  }

  setScheduledAt(autoScheduledAt: boolean) {
    this.autoScheduledAt = autoScheduledAt;
    console.log('auto transfer scheduled at -----> ', autoScheduledAt);
  }

  setMerchantId(merchantId: string) {
    console.log('merchantId --==>>>', merchantId);

    this.merchantId = merchantId;
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
    console.log('drafts in parent ---===>>>', this.draftPayees);
  }

  setRetention(checked: boolean) {
    this.retention = checked;
    this.cdr.detectChanges();
  }

  setRetentionAmount(amount: number) {
    this.retentionAmount = amount;
    this.cdr.detectChanges();
  }

  goBack() {
    this.router.navigate([environment.urlPortalPrefix + '/account']);
  }

  isSAValid(bank: string) {
    if (bank === banksTypes.ICICI || bank === banksTypes.IDFC) {
      return true;
    }
    return false;
  }

  setSelectedBank(bank: string) {
    this.selectedBank = bank;
    this.navNames =
      !this.isTesting &&
      this.isSAValid(this.selectedBank) && this.sourceAccountValidation
        ? [
            'Escrow Details',
            'Linked payee',
            'Document',
            'Statements',
            'Source Account'
          ]
        : !this.isTesting
        ? ['Escrow Details', 'Linked payee', 'Document', 'Statements']
        : this.isTesting &&
          this.isSAValid(this.selectedBank) && this.sourceAccountValidation
        ? [
            'Escrow Details',
            'Linked payee',
            'Document',
            'Statements',
            'Deposit',
            'Source Account'
          ]
        : [
            'Escrow Details',
            'Linked payee',
            'Document',
            'Statements',
            'Deposit'
          ];
    this.cdr.detectChanges();
  }
  ngOndestroy() {}
}

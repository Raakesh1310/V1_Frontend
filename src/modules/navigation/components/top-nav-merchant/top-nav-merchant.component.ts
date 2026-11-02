import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { MerchantUser } from '@modules/auth/models/merchantUser.model';
import { AuthService } from '@modules/auth/services';
import { BehaviorSubject, Observable } from 'rxjs';
import { getAccessFeatures } from './team-access';

@Component({
  selector: 'sbpro-top-nav-merchant',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-nav-merchant.component.pug',
  styleUrls: ['top-nav-merchant.component.scss']
})
export class TopNavMerchantComponent implements OnInit {
  @Input() placement = 'bottom-right';
  dropdownClasses: string[] = [];
  merchantUsers: MerchantUser[] = [];
  currentMerchantId: string | null = '';

  private _loading$ = new BehaviorSubject(false);

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  constructor(private authService: AuthService) {}

  ngOnInit() {
    /**
     * Load merchants
     */
    this._loading$.next(true);
    this.authService.getUserMerchants().subscribe(resp => {
      this._loading$.next(false);
      this.merchantUsers = resp.result;
    });

    this.currentMerchantId = this.authService.getMerchantId();
  }

  isMerchantIdSelected(merchantId: string) {
    return this.authService.isMerchantIdSelected(merchantId);
  }

  switchMerchant(merchantUserId: string) {
    console.log('Switching Merchant: ' + this.authService.getMerchantUserId());
    console.log('To: ' + merchantUserId);
    if (merchantUserId === this.authService.getMerchantUserId()) {
      console.log(
        'User already logged in with merchantUserId: ' + merchantUserId
      );
      return;
    }

    this.authService.switchMerchant(merchantUserId).subscribe(resp => {
      if (resp.success) {
        if (resp.result.roles[0] === 'custom') {
          const accessObject = getAccessFeatures(resp.result.access);
          switch (true) {
            case accessObject.accountList:
              window.location.href = '/portal/escrow';
              break;
            case accessObject.payeeList:
              window.location.href = '/portal/payee';
              break;
            case accessObject.addPayee:
              window.location.href = '/portal/payee/form';
              break;
            case accessObject.singleTransfer:
              window.location.href = '/portal/transfer';
              break;
            case accessObject.bulkTransfer:
              window.location.href = '/portal/transfer/bulk';
              break;
            case accessObject.escrowPages:
              window.location.href = '/portal/escrow-page';
              break;
            case accessObject.challans:
              window.location.href = '/portal/challan';
              break;
            case accessObject.bankAccounts:
              window.location.href = '/portal/bank-account';
              break;
            case accessObject.depositList:
              window.location.href = '/portal/bank-account/deposit';
              break;
            case accessObject.connectedBankingSingleTransfer:
              window.location.href = '/portal/transfer/bank-accounts';
              break;
            case accessObject.connectedBankingBulkTransfer:
              window.location.href = '/portal/transfer/bulk/bank-accounts';
              break;
            case accessObject.bankAccountTransfer:
              window.location.href = '/portal/passbook/bank-accounts';
              break;
            case accessObject.myPassbook:
              window.location.href = '/portal/transaction';
              break;
            default:
              break;
          }
        } else {
          window.location.href = '/dashboard';
        }
      }
    });
  }
}

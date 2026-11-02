import { Component, OnInit } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { RoleAccessPoint } from '@modules/profile/models/roleAccess.model';

@Component({
  selector: 'sbpro-passbook-overview-bank-accounts',
  templateUrl: './passbook-overview-bank-accounts.component.pug',
  styleUrls: ['./passbook-overview-bank-accounts.component.scss']
})
export class PassbookOverviewBankAccountsComponent implements OnInit {
  selectedIndexForFade = 0;
  onlySingleTransfer: boolean = false;
  onlyBulkTransfer: boolean = false;
  connectedBanking: boolean = false;
  constructor(private authService: AuthService) {
    let index = localStorage.getItem('Index');
    // @ts-ignore
    this.selectedIndexForFade = +index;
    localStorage.setItem('Index', '0');
  }

  ngOnInit(): void {
    this.connectedBanking = false;
    if (this.authService.getRole().includes('custom')) {
      let access = this.authService.getAccess() as RoleAccessPoint;
      if (
        access.connectedBankingTransfer?.includes('Single Transfer') &&
        !access.connectedBankingTransfer?.includes('Bulk Transfer')
      ) {
        this.onlySingleTransfer = true;
      }
      if (
        !access.connectedBankingTransfer?.includes('Single Transfer') &&
        access.connectedBankingTransfer?.includes('Bulk Transfer')
      ) {
        this.onlyBulkTransfer = true;
      }
    }
  }
}

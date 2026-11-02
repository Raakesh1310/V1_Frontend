import { Component, OnInit } from '@angular/core';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { AuthService } from '@modules/auth/services';
import transferSelection from '@modules/transfers/constants/transferSelection';

@Component({
  selector: 'sbpro-transfer-bank-account-overview',
  templateUrl: './transfer-bank-account-overview.component.pug',
  styleUrls: ['./transfer-bank-account-overview.component.scss']
})
export class TransferBankAccountOverviewComponent implements OnInit {
  merchantProfile: MerchantProfile | null;
  transferNormal: Boolean = true;
  constructor(private authService: AuthService) {
    this.merchantProfile = this.authService.getMerchantProfile();
  }

  ngOnInit(): void { }
  updateSelection(selection: string) {
    selection === transferSelection.toBankAccount ? this.transferNormal = true : this.transferNormal = false;
  }
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { RoleAccessPoint } from '@modules/profile/models/roleAccess.model';

@Component({
  selector: 'sbpro-passbook-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './passbook-overview.component.pug',
  styleUrls: ['passbook-overview.component.scss']
})
export class PassbookOverviewComponent implements OnInit {
  selectedIndexForFade = 0;
  connectedBanking: boolean = false;
  isTesting = false;
  onlySingleTransfer: boolean = false;
  onlyBulkTransfer: boolean = false;
  constructor(private authService: AuthService) {
    let index = localStorage.getItem('Index');
    // @ts-ignore
    this.selectedIndexForFade = +index;
    localStorage.setItem('Index', '0');
  }
  ngOnInit() {
    let merchantProfile = this.authService.getMerchantProfile();
    this.connectedBanking = false;
    this.isTesting = merchantProfile?.enableTesting
      ? merchantProfile?.enableTesting
      : false;

    if (this.authService.getRole().includes('custom')) {
      let access = this.authService.getAccess() as RoleAccessPoint;
      if (
        access.transfer?.includes('Single Transfer') &&
        !access.transfer?.includes('Bulk Transfer')
      ) {
        this.onlySingleTransfer = true;
      }
      if (
        !access.transfer?.includes('Single Transfer') &&
        access.transfer?.includes('Bulk Transfer')
      ) {
        this.onlyBulkTransfer = true;
      }
    }
  }
}

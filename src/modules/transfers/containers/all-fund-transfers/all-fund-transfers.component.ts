import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import merchantUserRoles from 'config/merchantUserRoles';

@Component({
  selector: 'sbpro-all-fund-transfers-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './all-fund-transfers.component.pug',
  styleUrls: ['all-fund-transfers.component.scss']
})
export class AllFundTransfersComponent implements OnInit {
  selectedIndexForFade = 0;
  readOnly = false;
  constructor(private authService: AuthService) {
    let index = localStorage.getItem('Index');
    // @ts-ignore
    this.selectedIndexForFade = +index;
    localStorage.setItem('Index', '0');
    this.checkForReadOnly();
  }
  ngOnInit() {}

  checkForReadOnly() {
    let roles = this.authService.getRole();
    if (
      (roles &&
        (roles?.indexOf(merchantUserRoles.TRUSTEE) > -1 ||
          roles?.indexOf(merchantUserRoles.SUPER_ADMIN_VIEWER) > -1)) ||
      roles?.indexOf(merchantUserRoles.MERCHANT_AUTHORIZER) > -1
    ) {
      this.readOnly = true;
    }
  }
}

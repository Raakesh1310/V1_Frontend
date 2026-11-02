import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import merchantUserRoles from 'config/merchantUserRoles';

@Component({
    selector: 'sbpro-bank-account-transfer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './bank-account-transfer.component.pug',
    styleUrls: ['bank-account-transfer.component.scss'],
})
export class BankAccountTransferComponent implements OnInit {
    selectedIndexForFade = 0;
    readOnly = false;
    isAdmin = false;
    constructor(private authService: AuthService) {
      let index = localStorage.getItem('Index');
      // @ts-ignore
      this.selectedIndexForFade = +index;
      localStorage.setItem('Index','0');
      this.checkForReadOnly();
      this.isAdmin = this.authService.isSuperAdmin();
    }
    ngOnInit() {}
  
    checkForReadOnly() {
      let roles = this.authService.getRole();
      if (
        roles &&
        (roles?.indexOf(merchantUserRoles.TRUSTEE) > -1 ||
          roles?.indexOf(merchantUserRoles.SUPER_ADMIN_VIEWER) > -1)
      ) {
        this.readOnly = true;
      }
    }
}

import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import merchantUserRoles from 'config/merchantUserRoles';

@Component({
  selector: 'sbpro-approval-overview',
  templateUrl: './approval-overview.component.pug',
  styleUrls: ['./approval-overview.component.scss']
})
export class ApprovalOverviewComponent implements OnInit {
  isMerchantAuthorizer = false;
  @ViewChild('merchant') merchant!: TemplateRef<any>;
  @ViewChild('singleTransfer') singleTransfer!: TemplateRef<any>;
  @ViewChild('bulkTransfer') bulkTransfer!: TemplateRef<any>;
  @ViewChild('payees') payees!: TemplateRef<any>;
  constructor(
    private authService: AuthService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.isMerchantAuthorizer =
      this.authService
        .getRole()
        ?.indexOf(merchantUserRoles.MERCHANT_AUTHORIZER) > -1
        ? true
        : false;
  }

  ngOnInit() { }

  get NavName(): string[] {
    if ([merchantUserRoles.MERCHANT_AUTHORIZER, merchantUserRoles.PAYEE_AUTHORIZER].every(val => this.authService
      .getRole().includes(val))) {
      return ["Merchants", "Single Transfers", "Bulk Transfers", "Payees"];
    } else if (this.isMerchantAuthorizer) {
      return ["Merchants", "Single Transfers", "Bulk Transfers"];
    } else if (this.authService.getRole().length === 1 && this.authService.getRole().includes(merchantUserRoles.PAYEE_AUTHORIZER)) {
      return ["Payees"]
    } else if (this.authService.getRole().length > 1 && this.authService.getRole().includes(merchantUserRoles.PAYEE_AUTHORIZER)) {
      return ["Single Transfers", "Bulk Transfers", "Payees"]
    }
    return ["Single Transfers", "Bulk Transfers"];
  }

  get Template(): any[] {
    if ([merchantUserRoles.MERCHANT_AUTHORIZER, merchantUserRoles.PAYEE_AUTHORIZER].every(val => this.authService
      ?.getRole().includes(val))) {
      return [this.merchant, this.singleTransfer, this.bulkTransfer, this.payees];
    } else if (this.isMerchantAuthorizer) {
      return [this.merchant, this.singleTransfer, this.bulkTransfer];
    } else if (this.authService.getRole()?.length === 1 && this.authService.getRole().includes(merchantUserRoles.PAYEE_AUTHORIZER)) {
      return [this.payees]
    } else if (this.authService.getRole()?.length > 1 && this.authService.getRole().includes(merchantUserRoles.PAYEE_AUTHORIZER)) {
      return [this.singleTransfer, this.bulkTransfer, this.payees]
    }
    return [this.singleTransfer, this.bulkTransfer];
  }

  ngAfterViewInit(){
    this.changeDetector.detectChanges();
  }

}

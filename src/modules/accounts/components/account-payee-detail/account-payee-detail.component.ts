import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Account } from '@modules/accounts/models/accounts.model';
import { AccountsAdminService } from '@modules/accounts/services';
import { DocumentsService } from '@modules/documents/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-account-payee-detail',
  templateUrl: './account-payee-detail.component.pug',
  styleUrls: ['./account-payee-detail.component.scss']
})
export class AccountPayeeDetailComponent implements OnInit {
  @Input() accountId = '';
  account?: Account;
  loading = true;

  constructor(
    private documentService: DocumentsService,
    private accountAdminService: AccountsAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getAccount();
  }

  getPayee(payeeId: string) {
    return this.account?.payees.filter(payee => payee.payeeId === payeeId)[0];
  }

  getAccount() {
    console.log('account details fetching for ', this.accountId);
    this.accountAdminService
      .getAccount(this.accountId)
      .subscribe((resp: any) => {
        if (resp.success) {
          this.loading = false;
          this.account = resp.result;
          this.cdr.detectChanges();
        }
        console.log(this.account);
      });
  }
}

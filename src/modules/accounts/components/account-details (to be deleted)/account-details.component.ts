import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { AccountsAdminService } from '@modules/accounts/services';
import { SortEvent } from '@modules/tables/directives';
import { environment } from 'environments/environment';

@Component({
  selector: 'sbpro-account-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-details.component.pug',
  styleUrls: ['account-details.component.scss']
})
export class AccountDetailsComponent implements OnInit {
  gstFile = '';
  panFile = '';
  cheqFile = '';
  logoFile = '';
  authpanFile = '';
  account: any;
  acc: any;
  isAuto = false;

  constructor(
    public accountsService: AccountsAdminService,
    private cdr: ChangeDetectorRef
  ) {
    this.account = [];
  }

  ngOnInit() {
    if (history.state.account) {
      this.accountsService
        .getAccount(history.state.account._id)
        .subscribe(resp => {
          this.account = resp.result;
          this.acc = resp.result[0];
          //   resp.result.forEach(element => {
          //     this.account.push(element);
          //   });
          //   this.profile.email = history.state.profile.email;
          //   this.gstFile = resp.result.docBusinessGstOriginal;
          //   this.panFile = resp.result.docBusinessPanOriginal;
          //   this.cheqFile = resp.result.docCancelledChequeOriginal;
          //   this.logoFile = resp.result.docBusinessLogoOriginal;
          //   this.authpanFile = resp.result.docAuthorizedPersonPanOriginal;
          this.cdr.detectChanges();

          // console.log(this.account);
        });
    }
  }

  downloadDoc(doc: { docName: string }) {
    return environment.apiHost + '/uploads/docs/' + doc.docName;
  }

  // tslint:disable-next-line:no-any
  async updateStatus(event: any) {
    await this.accountsService
      .updateStatus(this.acc._id, event.target.checked)
      // tslint:disable-next-line:no-any
      .subscribe((resp: any) => {});
  }

  onSort({ column, direction }: SortEvent) {
    // this.sortedColumn = column;
    // this.sortedDirection = direction;
    // this.countryService.sortColumn = column;
    // this.countryService.sortDirection = direction;
    // this.changeDetectorRef.detectChanges();
  }
}

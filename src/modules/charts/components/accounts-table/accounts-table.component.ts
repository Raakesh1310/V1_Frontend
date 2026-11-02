import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from '@common/services';
import { AuthService } from '@modules/auth/services';
import { BankAccount } from '@modules/bank-account/models';
import { BankAccountService } from '@modules/bank-account/services';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sbpro-accounts-table',
  templateUrl: './accounts-table.component.pug',
  styleUrls: ['./accounts-table.component.scss']
})
export class AccountsTableComponent implements OnInit {
  bankStatements$!: Observable<BankAccount[]>;
  accBal: number[] = [];
  currMerchantId!: string | null;
  isAdmin = false;
  total$!: number;
  loadingData = false;
  private _loadingList$ = new BehaviorSubject(false);

  constructor(
    private authService: AuthService,
    private bankAccountService: BankAccountService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private utilityService: UtilityService
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
    this.currMerchantId = this.authService.getMerchantId();
  }

  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  ngOnInit(): void {
    this.bankStatements$ = this.bankAccountService.bankStatement$;
    this.loadData({ page: 1 });
    this._loadingList$.next(false);
  }

  loadData(params: any) {
    this._loadingList$.next(true);
    this.loadingData = true;
    this.bankAccountService
      .retrieveBankAccounts(this.isAdmin, this.currMerchantId, params)
      .subscribe(resp => {
        if (resp) {
          this.loadingData = false;
          this.total$ = resp.allItemsCount;
          this._loadingList$.next(false);
          this.cdr.detectChanges();
        }
      });
    this.bankAccountService
      .getBalance(this.isAdmin, this.currMerchantId)
      .subscribe(resp => {
        this.accBal = resp.result;
        console.log(resp);
      });
  }

  public toINR(val: number) {
    return this.utilityService.toINR(val);
  }

  redirectToBankAccounts() {
    this.router.navigate([environment.urlPortalPrefix + '/bank-account/']);
  }
}

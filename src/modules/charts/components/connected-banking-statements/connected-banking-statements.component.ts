import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from '@common/services';
import { AuthService } from '@modules/auth/services';
import { BankAccount, BankStatement } from '@modules/bank-account/models';
import { BankAccountService } from '@modules/bank-account/services';
import { BankStatementsService } from '@modules/bank-account/services/bank-statements.service';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'sbpro-connected-banking-statements',
  templateUrl: './connected-banking-statements.component.pug',
  styleUrls: ['./connected-banking-statements.component.scss']
})
export class ConnectedBankingStatementsComponent implements OnInit {
  @Input() bankNames!: string[];
  bankAccountNo: string = '';
  private _loadingList$ = new BehaviorSubject(false);
  isAdmin = false;
  merchantId!: string | null;
  bankAccounts$!: Observable<BankAccount[]>;
  total$!: number;
  bankAccounts!: BankAccount[];
  bankStatements$!: Observable<BankStatement[]>;
  loadingData = false;

  constructor(
    private authService: AuthService,
    private bankAccountService: BankAccountService,
    private cdr: ChangeDetectorRef,
    public bankStatementService: BankStatementsService,
    private utilityService: UtilityService,
    private router: Router
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
    this.merchantId = this.authService.getMerchantId();
  }

  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  ngOnInit() {
    this.loadingData = true;
    this.bankAccountService.bankAccountNo$.subscribe(bankAccountNo => {
      this.bankAccountNo = '';
      this.bankAccountNo = bankAccountNo;
      this.cdr.detectChanges();
      this.loadData({ page: 1 });
    });
  }

  loadData(params: any) {
    this._loadingList$.next(true);
    this.loadStatements(this.bankAccountNo);
  }

  loadStatements(bankAccountNo: string) {
    this._loadingList$.next(true);
    this.bankStatements$ = this.bankStatementService.statement$;

    this.bankStatementService
      .retrieveBankStatements(
        this.isAdmin,
        (bankAccountNo as unknown) as string
      )
      .subscribe(resp => {
        this.loadingData =false;
        this._loadingList$.next(false);
        this.cdr.detectChanges();
      });
  }

  public toINR(number: number) {
    let updated = this.utilityService.toINR(number);
    return updated ? updated : null;
  }

  public toIST(date: Date) {
    let dateStr = date.toString();
    let newTime = this.utilityService
      .parseByTimeZone(dateStr, 'Asia/Kolkata')
      .format('DD MMM YYYY');
    return newTime;
  }

  redirectToStatements(event: any) {
    console.log(event);
    let bankAccountNo = event.source._value[0].bankAccountNo;
    this.router.navigate([
      environment.urlPortalPrefix + '/bank-account/' + bankAccountNo
    ]);
  }
}

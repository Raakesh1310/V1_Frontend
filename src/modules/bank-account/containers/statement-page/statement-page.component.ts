import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@modules/auth/services';
import { BankAccountService } from '@modules/bank-account/services';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'sbpro-statement-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './statement-page.component.pug',
  styleUrls: ['./statement-page.component.scss']
})
export class StatementPageComponent implements OnInit {
  merchantId = '';
  bankAccountNo: string = '';
  accountType: string = '';
  loading = false;
  isAdmin = false;
  enableConnectedBankingWithVA = false;
  @ViewChild('basic') basic: TemplateRef<any> | undefined;
  @ViewChild('escrowparties') escrowparties: TemplateRef<any> | undefined;
  @ViewChild('statements') statements: TemplateRef<any> | undefined;
  @ViewChild('agreement') agreement: TemplateRef<any> | undefined;
  @ViewChild('digitalEscrowList') digitalEscrowList:
    | TemplateRef<any>
    | undefined;
  // @Output() emitMerchantId: EventEmitter<string> = new EventEmitter<string>();
  navNames: string[] = [];
  templates: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private bankAccountService: BankAccountService,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.ngAfterViewInit();
  }

  ngAfterViewInit() {
    this.isAdmin = this.authService.isSuperAdmin();
    this.spinner.show();
    this.activatedRoute.paramMap.subscribe(resp => {
      this.bankAccountNo = resp.get('accountId') || '';

      console.log(this.bankAccountNo);
    });
    this.loading = true;
    this.bankAccountService
      .fetchAccount(this.isAdmin, { bankAccountNo: this.bankAccountNo })
      .subscribe((resp: any) => {
        console.log(resp);
        if (resp) {
          this.merchantId = resp[0].merchantId;
          this.navNames = [];
          this.templates = [];
          this.accountType = resp[0].accountType;
          this.enableConnectedBankingWithVA =
            resp[0].enableConnectedBankingWithVA;
          if (this.accountType === 'Escrow Account') {
            this.navNames = [
              'Statement',
              'Agreement',
              'Escrow Parties'
            ];
            this.templates = [
              this.statements,
              this.agreement,
              this.escrowparties
            ];
          }

          if (this.accountType === 'Current Account') {
            this.navNames = ['Statement'];
            this.templates = [this.statements];
          }

          if (this.enableConnectedBankingWithVA) {
            this.navNames.push('Digital Escrow List');
            this.templates.push(this.digitalEscrowList);
          }
          // this.emitMerchantId.emit(this.merchantId);
        }

        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      });
  }
}

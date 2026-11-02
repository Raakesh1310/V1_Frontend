import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DATE_DIFFERENTIAL_IN_MONTH } from '@common/constants/common.constant';
import { UtilityService } from '@common/services';
import { dateMonthDifference } from '@common/services/dateMonthDifference';
import { AuthService } from '@modules/auth/services';
import { BankAccountDepositInterface } from '@modules/bank-account/models';
import { BankAccountDepositService } from '@modules/bank-account/services/bank-account-transaction-deposit.service';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { Observable, BehaviorSubject } from 'rxjs';
import { SortEvent } from '@modules/tables/directives';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import bankTypeArrayConstant from '@common/constants/bankTypeArray.constant';
import banksTypes from '@modules/accounts/constants/banksTypes';
import { MerchantProfileBank } from '@modules/auth/models/merchantProfile.model';

@Component({
  selector: 'sbpro-deposit-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bank-account-deposit-list.component.pug',
  styleUrls: ['./bank-account-deposit-list.component.scss']
})
export class DepositListComponent implements OnInit {
  @Input() pageSize = 8;
  model!: NgbDateStruct;
  deposits$!: Observable<BankAccountDepositInterface[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  filtersVisible = true;
  clearForm = false;
  isSuperAdmin = false;
  banks: string[] = [];
  merchantProfile!: any;
  constructor(
    public bankaccountdepositService: BankAccountDepositService,
    public changeDetectorRef: ChangeDetectorRef,
    private calendar: NgbCalendar,
    private utilityService: UtilityService,
    private authService: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef
  ) {
    this.isSuperAdmin = this.authService.isSuperAdmin();
    this.merchantProfile = this.authService.getMerchantProfile();
  }

  ngOnInit() {
    this.banks = [];
    if (this.isSuperAdmin) {
      this.banks = bankTypeArrayConstant;
    } else {
      this.assignBanks();
    }

    this.spinner.show();
    this.bankaccountdepositService.pageSize = this.pageSize;
    this.deposits$ = this.bankaccountdepositService.deposit$;
    this.total$ = this.bankaccountdepositService.total$;
    const { dateFrom, dateTo } = dateMonthDifference(
      new Date(),
      DATE_DIFFERENTIAL_IN_MONTH
    );
    this.bankaccountdepositService.dateFrom = new NgbDate(
      dateFrom.year,
      dateFrom.month,
      dateFrom.day
    );
    this.bankaccountdepositService.dateTo = new NgbDate(
      dateTo.year,
      dateTo.month,
      dateTo.day
    );
    this.bankaccountdepositService.performSearch();
    this.spinner.hide();
    this.cdr.detectChanges();
  }

  onSort({ column, direction }: SortEvent) {
    this.sortedColumn = column;
    this.sortedDirection = direction;
    this.bankaccountdepositService.sortColumn = column;
    this.bankaccountdepositService.sortDirection = direction;
    this.changeDetectorRef.detectChanges();
  }

  clearSearchForm() {
    this.clearForm = false;
    this.bankaccountdepositService.bank = '';
    this.bankaccountdepositService.searchTerm = '';
    this.bankaccountdepositService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.bankaccountdepositService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.bankaccountdepositService.performSearch();
  }

  submitSearchForm() {
    this.clearForm = true;
    console.log('Submitting Search Form');

    // Reload the data
    this.bankaccountdepositService.performSearch();
  }

  getParsedDate(inputDate: Date) {
    let newTime = new Date(inputDate.toString()).toUTCString();
    return newTime;
  }

  refreshData() {
    this.spinner.show();
    this.bankaccountdepositService.performSearch();
    this.spinner.hide();
  }

  /**
   * Format number according to Indian currency
   * @param number
   * @returns
   */
  public toINR(number: number) {
    return this.utilityService.toINR(number);
  }

  capitalizeBankName(inputString: string) {
    if (!inputString) {
      return '';
    }

    let words;
    if (inputString.includes('_')) {
      // Split the string by underscore
      words = inputString.split('_');
      const capitalizedString = words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return capitalizedString;
    }
    return inputString.toUpperCase();
  }

  openDetails(merchantId: string) {
    this.router.navigate([
      environment.urlAdminPrefix + '/merchant/' + merchantId
    ]);
  }

  assignBanks() {
    this.merchantProfile.banks.forEach((bank: MerchantProfileBank) => {
      let bankName =
        bank.bankName === banksTypes.YES_BANK
          ? bank.bankName.split('_')[0]
          : bank.bankName;
      if (this.merchantProfile[bankName + 'Banks']?.length > 0) {
        let accountWithoutVA = this.merchantProfile[bankName + 'Banks'].filter(
          (account: any) => {
            return account?.enableConnectedBanking === true;
          }
        );
        if (accountWithoutVA?.length > 0) {
          this.banks.push(bankName.toUpperCase());
        }
      }
    });
    this.cdr.detectChanges();
  }
}

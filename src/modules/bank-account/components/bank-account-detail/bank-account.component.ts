import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthService } from '@modules/auth/services';
import { BankAccount } from '@modules/bank-account/models';
import { BankAccountService } from '@modules/bank-account/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastService, UtilityService } from '@common/services';
import { Merchant } from '@modules/auth/models/merchant.model';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import bankTypeArrayConstant from '@common/constants/bankTypeArray.constant';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import banksTypes from '@modules/accounts/constants/banksTypes';
@Component({
  selector: 'sbpro-bank-account',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bank-account.component.pug',
  styleUrls: ['./bank-account.component.scss']
})
export class BankAccountComponent implements OnInit {
  @Input() hideHeader = false;
  @Input() isAdmin = false;
  @Input() merchantId = '';
  bankStatements$!: Observable<BankAccount[]>;
  private _loadingList$ = new BehaviorSubject(false);
  private modalRef?: NgbModalRef;
  bankAccountForm!: FormGroup;
  bankName!: string;
  accountName!: string;
  bankAccountNo!: string;
  errors: string[] = [];
  ifscCode!: string;
  branchName!: string;
  accountBalance$!: Observable<Number[]>;
  total$!: Observable<number | undefined>;
  page = 1;
  pageSize = 10;
  merchants: Merchant[] = [];
  selectedMerchant: Merchant | undefined;
  currMerchantId!: string | null;
  accBal: number[] = [];
  url = '';
  effectiveBalance!: number;
  bankAccounts: any[] = [];
  searchString: string = '';
  banks: string[] = [];
  selectedBank: string = '';
  merchantProfile!: any;
  refreshAllowed: boolean = false;
  toastHead: string = '';
  toastBody: string = '';
  loading: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private bankAccountService: BankAccountService,
    private authService: AuthService,
    private utilityService: UtilityService,
    private router: Router,
    private _location: Location,
    private toastService: ToastService
  ) {
    if (!this.hideHeader) {
      this.isAdmin = this.authService.isSuperAdmin();
    }
    this.currMerchantId = this.authService.getMerchantId();
    this.merchantProfile = this.authService.getMerchantProfile();
  }
  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  ngOnInit() {
    this.refreshAllowed = this.merchantProfile.enableBalanceRefresh;
    this.banks = [];
    if (this.isAdmin) {
      this.banks = bankTypeArrayConstant;
    } else {
      this.assignBanks();
    }
    if (!this.isAdmin) {
      this.accountBalance$ = this.bankAccountService.balance$;
    }
    this.loadData({ page: 1, isAdmin: this.isAdmin, fetchBal: false });
  }

  loadData(params?: any) {
    this._loadingList$.next(true);
    this.spinner.show();
    this.bankAccountService
      .getCombinedData(
        this.isAdmin,
        this.isAdmin && this.merchantId
          ? this.merchantId
          : !this.isAdmin && this.currMerchantId
          ? this.currMerchantId
          : '',
        params
      )
      .subscribe(
        data => {
          this.bankAccounts = data;
          this._loadingList$.next(false);
          this.spinner.hide();
          this.cdr.detectChanges();
        },
        error => {
          this.bankAccounts = [];
          this._loadingList$.next(false);
          this.spinner.hide();
          console.log(error);
        }
      );
    this.total$ = this.bankAccountService.total$;
  }
  refereshData() {
    this.ngOnInit();
    this.page = 1;
    this.cdr.detectChanges();
  }

  submitSearchForm() {
    this.loadData({
      // page: this.page,
      isAdmin: this.isAdmin,
      s: this.searchString,
      selectedBank: this.selectedBank,
      fetchBal: false
    });
    this.cdr.detectChanges();
  }

  clearSearchForm() {
    this.searchString = '';
    this.selectedBank = '';
    this.cdr.detectChanges();
    this.ngOnInit();
  }

  public toINR(number: number) {
    let updated = this.utilityService.toINR(number);
    return updated;
  }

  pageChange(event: any) {
    this.page = event;
    const params: any = {
      page: event,
      isAdmin: this.isAdmin,
      s: this.searchString,
      selectedBank: this.selectedBank,
      fetchBal: false
    };
    this.loadData(params);
    this.cdr.detectChanges();
  }

  refreshPage() {
    this.loadData({
      page: this.page,
      isAdmin: this.isAdmin,
      refreshAll: true,
      fetchBal: false
    });
    this.cdr.detectChanges();
  }

  getStatement(accountId: string) {
    if (this.isAdmin) {
      this.router.navigate([
        environment.urlAdminPrefix + '/bank-account/' + accountId
      ]);
    } else {
      this.router.navigate([
        environment.urlPortalPrefix + '/bank-account/' + accountId
      ]);
    }
  }

  tempMethod(value1: number, value2: number) {
    console.log(value1 - value2);
    return value1 - value2;
  }

  downloadReport() {
    let id = '';
    if (this.isAdmin) {
      id = this.merchantId;
    } else {
      id = this.currMerchantId ? this.currMerchantId : '';
    }

    this.url = this.bankAccountService.updateReportDownloadLink(this.page, id);
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

  refreshAccountBalance(
    merchantId: string,
    bankAccountNo: string,
    bankName: string
  ) {
    this.loading = true;
    this.bankAccountService
      .getActiveBalance(merchantId, bankAccountNo, bankName)
      .subscribe(resp => {
        if (resp.result.balanceFetched) {
          this.updateBalance(resp.result);
          this.toastHead = 'Success';
          this.toastBody = 'Balance updated successfully';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-success text-white'
          });
        } else {
          this.toastHead = 'Failed';
          this.toastBody = 'Failed to fetch balance.Please try again later';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  updateBalance(balanceObj: any) {
    this.spinner.show();
    this.bankAccounts.map(bankAccounts => {
      if (bankAccounts.bankAccountNo === balanceObj.bankAccountNumber) {
        bankAccounts.balance = balanceObj.activeBalance;
        bankAccounts.effectiveBalance = balanceObj.effectiveBalance;
        bankAccounts.balanceUpdatedOn = new Date();
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    this.spinner.hide();
  }

  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 9000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }

  toLocalTime(lastUpdatedAt: string) {
    const isoDate = new Date(lastUpdatedAt);
    const updatedDate = isoDate.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return updatedDate;
  }

  goBack() {
    this._location.back();
  }

  assignBanks() {
    this.merchantProfile.banks.forEach((bank: any) => {
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

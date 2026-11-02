import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { AuthService } from '@modules/auth/services/auth.service';
import DashboardFiltersInterface from '@modules/dashboard/interfaces/dashboard-filters.interface';
import { DashboardResponseModel } from '@modules/dashboard/models/dashboard-response.model';
import { DashboardService } from '@modules/dashboard/services/dashboard.service';
import { forkJoin } from 'rxjs';

import NumberHelper from '../../../../helpers/number.helper';
import { ProfileService } from '@modules/profile/services';

@Component({
  selector: 'sbpro-dashboard-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-cards.component.pug',
  styleUrls: ['dashboard-cards.component.scss']
})
export class DashboardCardsComponent implements OnInit, AfterViewInit {
  @Input() startDate!: Date;
  @Input() endDate!: Date;
  @Input() bankNames!: string[];
  @Input() cb!: boolean;

  loadingNumTransactions = false;
  numTransactions = '';

  loadingNumTransfers = false;
  numTransfers = '';

  loadingTransferAmount = false;
  transferAmount = '';

  loadingTransactionAmount = false;
  transactionAmount = '';

  loadingAvailableBalance = false;
  availableBalance = '';

  loadingAverageTransactionAmount = false;
  averageTransactionAmount = '';

  loadingAverageTransferAmount = false;
  averageTransferAmount = '';

  loadingTotalBilledAmount = false;
  totalBilledAmount = '';

  loadingMerchantCount = false;
  merchantCount = -1;

  loadingAverageDailyBalance = false;
  averageDailyBalance = '';

  connectedBanking = false;
  merchantId!: string | null;

  @Input() dashboardData!: DashboardResponseModel;
  isAdmin = false;
  dataFromParent = true;
  allBanks = false;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private merchantProfileService: ProfileService
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
    this.merchantId = this.authService.getMerchantId();
    // if (this.merchantId) {
    //   this.merchantProfileService.getProfile(null).subscribe(resp => {
    //     if (resp.result.isAccountAddAllowed || resp.result.connectedBanking) {
    //       this.connectedBanking = this.cb !== undefined
    //         ? this.cb
    //         : resp.result.connectedBanking;
    //     }
    //     this.cdr.detectChanges();
    //   });
    // }
  }

  ngAfterViewInit(): void {}

  ngOnInit() {
    if (this.bankNames[0] === 'All Banks') {
      this.allBanks = true;
    }
    if (this.merchantId) {
      this.merchantProfileService.getProfile(null).subscribe(resp => {
        if (resp.result.isAccountAddAllowed || resp.result.connectedBanking) {
          this.connectedBanking =
            this.cb !== undefined ? this.cb : resp.result.connectedBanking;
        }
        this.cdr.detectChanges();
        this.refreshDataNew();
      });
    }
  }

  refreshDataNew(
    filters: Partial<
      DashboardFiltersInterface
    > = {} as DashboardFiltersInterface
  ) {
    // Adjust filters
    if (filters.startDate) this.startDate = filters.startDate;
    if (filters.endDate) this.endDate = filters.endDate;
    if (filters.bankNames) this.bankNames = filters.bankNames;

    this.loadingNumTransactions = true;
    this.loadingTransactionAmount = true;
    this.loadingAverageTransactionAmount = true;
    this.loadingNumTransfers = true;
    this.loadingTransferAmount = true;
    this.loadingAverageTransferAmount = true;
    this.loadingMerchantCount = true;
    this.loadingTotalBilledAmount = true;
    this.loadingAverageDailyBalance = true;

    this.dashboardService
      .fetchFigures(
        {
          startDate: this.startDate,
          endDate: this.endDate,
          bankNames: this.bankNames,
          connectedBanking: this.connectedBanking
        },
        [
          'numInwardTransactions',
          'totalAmountInwardTransactions',
          'averageDailyAmountInwardTransactions'
        ]
      )
      .subscribe(resp => {
        this.loadingNumTransactions = false;
        this.loadingTransactionAmount = false;
        this.loadingAverageTransactionAmount = false;

        this.numTransactions = NumberHelper.getInstance().formatNumber(
          resp.result.numInwardTransactions
        );
        this.transactionAmount = NumberHelper.getInstance().formatCurrency(
          resp.result.totalAmountInwardTransactions
        );
        this.averageTransactionAmount = NumberHelper.getInstance().formatCurrency(
          resp.result.averageDailyAmountInwardTransactions
        );
        this.cdr.detectChanges();
      });

    this.dashboardService
      .fetchFigures(
        {
          startDate: this.startDate,
          endDate: this.endDate,
          bankNames: this.bankNames,
          connectedBanking: this.connectedBanking
        },
        [
          'numOutwardTransfers',
          'totalAmountOutwardTransfer',
          'averageDailyAmountOutwardTransfer'
        ]
      )
      .subscribe(resp => {
        this.loadingNumTransfers = false;
        this.loadingTransferAmount = false;
        this.loadingAverageTransferAmount = false;

        this.numTransfers = NumberHelper.getInstance().formatNumber(
          resp.result.numOutwardTransfers
        );
        this.transferAmount = NumberHelper.getInstance().formatCurrency(
          resp.result.totalAmountOutwardTransfer
        );
        this.averageTransferAmount = NumberHelper.getInstance().formatCurrency(
          resp.result.averageDailyAmountOutwardTransfer
        );
        this.cdr.detectChanges();
      });

    if (this.isAdmin) {
      this.dashboardService
        .fetchFigures(
          {
            startDate: this.startDate,
            endDate: this.endDate,
            bankNames: this.bankNames
          },
          [
            'numMerchants',
            'totalAmountMerchantBilling',
            'averageDailyAmountMerchant'
          ]
        )
        .subscribe(resp => {
          this.loadingMerchantCount = false;
          this.loadingTotalBilledAmount = false;
          this.loadingAverageDailyBalance = false;

          this.merchantCount = resp.result.numMerchants;
          this.totalBilledAmount = NumberHelper.getInstance().formatCurrency(
            resp.result.totalAmountMerchantBilling
          );
          this.averageDailyBalance = NumberHelper.getInstance().formatCurrency(
            resp.result.averageDailyAmountMerchant
          );
          this.cdr.detectChanges();
        });
    }
  }

  refreshData() {
    // We'll create observables collection
    // before going to hit the api
    const observables = [];

    this.loadingNumTransactions = true;
    observables.push(
      this.dashboardService.fetchDashboardFigure(
        DashboardService.MODULES.INWARD_TRANSACTION,
        DashboardService.SECTIONS.COUNT,
        {
          startDate: this.startDate,
          endDate: this.endDate,
          bankNames: this.bankNames
        }
      )
    );

    this.loadingTransactionAmount = true;
    observables.push(
      this.dashboardService.fetchDashboardFigure(
        DashboardService.MODULES.INWARD_TRANSACTION,
        DashboardService.SECTIONS.TOTAL_AMOUNT,
        {
          startDate: this.startDate,
          endDate: this.endDate,
          bankNames: this.bankNames
        }
      )
    );

    this.loadingAverageTransactionAmount = true;
    observables.push(
      this.dashboardService.fetchDashboardFigure(
        DashboardService.MODULES.INWARD_TRANSACTION,
        DashboardService.SECTIONS.AVERAGE_DAILY_AMOUNT,
        {
          startDate: this.startDate,
          endDate: this.endDate,
          bankNames: this.bankNames
        }
      )
    );

    /**
     * Outward transfer related queries
     */
    this.loadingNumTransfers = true;
    observables.push(
      this.dashboardService.fetchDashboardFigure(
        DashboardService.MODULES.OUTWARD_TRANSACTION,
        DashboardService.SECTIONS.COUNT,
        {
          startDate: this.startDate,
          endDate: this.endDate,
          bankNames: this.bankNames
        }
      )
    );

    this.loadingTransferAmount = true;
    observables.push(
      this.dashboardService.fetchDashboardFigure(
        DashboardService.MODULES.OUTWARD_TRANSACTION,
        DashboardService.SECTIONS.TOTAL_AMOUNT,
        {
          startDate: this.startDate,
          endDate: this.endDate,
          bankNames: this.bankNames
        }
      )
    );

    this.loadingAverageTransferAmount = true;
    observables.push(
      this.dashboardService.fetchDashboardFigure(
        DashboardService.MODULES.OUTWARD_TRANSACTION,
        DashboardService.SECTIONS.AVERAGE_DAILY_AMOUNT,
        {
          startDate: this.startDate,
          endDate: this.endDate,
          bankNames: this.bankNames
        }
      )
    );

    /**
     * Merchant related queries
     */
    this.loadingMerchantCount = true;
    observables.push(
      this.dashboardService.fetchDashboardFigure(
        DashboardService.MODULES.MERCHANT,
        DashboardService.SECTIONS.COUNT,
        {
          startDate: this.startDate,
          endDate: this.endDate,
          bankNames: this.bankNames
        }
      )
    );

    this.loadingTotalBilledAmount = true;
    observables.push(
      this.dashboardService.fetchDashboardFigure(
        DashboardService.MODULES.MERCHANT,
        DashboardService.SECTIONS.BILLING_AMOUNT,
        {
          startDate: this.startDate,
          endDate: this.endDate,
          bankNames: this.bankNames
        }
      )
    );

    this.loadingAverageDailyBalance = true;
    observables.push(
      this.dashboardService.fetchDashboardFigure(
        DashboardService.MODULES.MERCHANT,
        DashboardService.SECTIONS.AVERAGE_DAILY_BALANCE,
        {
          startDate: this.startDate,
          endDate: this.endDate,
          bankNames: this.bankNames
        }
      )
    );

    // Now we've all the set of observables prepared
    // Now we will hit the api server simultaneously
    // this.loadingData = true;
    forkJoin(observables).subscribe(resp => {
      // console.log('Found following data from observables..');
      // console.log(resp);

      // Handle num transactions response
      this.loadingNumTransactions = false;
      this.numTransactions = NumberHelper.getInstance().formatNumber(
        resp[0].result
      );

      // Handle transaction amount
      this.loadingTransactionAmount = false;
      this.transactionAmount = NumberHelper.getInstance().formatCurrency(
        resp[1].result
      );

      // Handle Average transaction amount
      this.loadingAverageTransactionAmount = false;
      this.averageTransactionAmount = NumberHelper.getInstance().formatCurrency(
        resp[2].result
      );

      // Handle Num transfers
      this.loadingNumTransfers = false;
      this.numTransfers = NumberHelper.getInstance().formatNumber(
        resp[3].result
      );

      // Handle transfer amount
      this.loadingTransferAmount = false;
      this.transferAmount = NumberHelper.getInstance().formatCurrency(
        resp[4].result
      );

      // Handle transfer amount
      this.loadingAverageTransferAmount = false;
      this.averageTransferAmount = NumberHelper.getInstance().formatCurrency(
        resp[5].result
      );

      // Handle merchant count
      this.loadingMerchantCount = false;
      this.merchantCount = resp[6].result;

      // Handle billed amount
      this.loadingTotalBilledAmount = false;
      this.totalBilledAmount = NumberHelper.getInstance().formatCurrency(
        resp[7].result
      );

      // Handle daily average balance
      this.loadingAverageDailyBalance = false;
      this.averageDailyBalance = NumberHelper.getInstance().formatCurrency(
        resp[8].result
      );

      this.cdr.detectChanges();
    });
  }

  // checkBeforeCall(resp: DashboardResponseModel) {
  //   const a = moment(this.datesObject.startDate);
  //   const b = moment(this.datesObject.endDate);
  //   console.log('DIFF ', b.diff(a, 'days') + 1); // as end date is bigger then start date
  //   const difference = b.diff(a, 'days') + 1;
  //   if (resp.success) {
  //     const avgTransfer =
  //       Number(resp.result.totalTransferAmount) / Number(difference);
  //     const avgTransaction =
  //       Number(resp.result.totalTransactionAmount) / Number(difference);
  //     console.log(
  //       this.formatCurrency(avgTransfer) +
  //         ' ' +
  //         this.formatCurrency(avgTransaction)
  //     );
  //     if (resp.result.totalNumTransactions > 0) {
  //       this.avgTransactionAmt = this.formatCurrency(avgTransaction);
  //     } else {
  //       this.avgTransactionAmt = '0';
  //     }
  //     if (resp.result.totalNumTransfers > 0) {
  //       this.avgTransferAmt = this.formatCurrency(avgTransfer);
  //     } else {
  //       this.avgTransferAmt = '0';
  //     }
  //     // if(resp.result.totalBilledAmount > 0) {
  //     this.totalBilledAmount = this.formatCurrency(
  //       resp.result.totalBilledAmount
  //     );
  //     // }
  //     this.merchantInDateRange = resp.result.merchantInDateRange
  //       ? resp.result.merchantInDateRange.toLocaleString()
  //       : '0';
  //     this.totalNumTransactions = resp.result.totalNumTransactions
  //       ? resp.result.totalNumTransactions.toLocaleString()
  //       : '0';
  //     this.totalNumTransfers = resp.result.totalNumTransfers
  //       ? resp.result.totalNumTransfers.toLocaleString()
  //       : '0';
  //     this.totalTransferAmount = this.formatCurrency(
  //       resp.result.totalTransferAmount
  //     );
  //     this.totalTransactionAmount = this.formatCurrency(
  //       resp.result.totalTransactionAmount
  //     );
  //     this.totalAvailableBalance = this.formatCurrency(
  //       resp.result.totalAvailableBalance
  //     );
  //     this.averageDailyBalance = this.formatCurrency(
  //       resp.result.averageDailyBalance
  //     );
  //     this.cdr.detectChanges();
  //   }
  // }

  // fetchData() {
  //   this.dashboardService
  //     .fetchDashboardData(this.datesObject)
  //     .subscribe((resp: DashboardResponseModel) => {

  //       //console.log('DATES OBJEC ', moment(this.datesObject.startDate));
  //
  //     });
  // }

  // formatCurrency(num: number) {
  //   return num.toLocaleString('en-IN', {
  //     maximumFractionDigits: 2,
  //     style: 'currency',
  //     currency: 'INR'
  //   });
  // }
}

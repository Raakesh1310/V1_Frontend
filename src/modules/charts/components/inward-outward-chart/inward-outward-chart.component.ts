import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { AuthService } from '@modules/auth/services';
import { ChartsService } from '@modules/charts/services';
import { DashboardService } from '@modules/dashboard/services';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';

import transferStatus from '../../../../config/transferStatus';
import NumberHelper from '../../../../helpers/number.helper';
import { ProfileService } from '@modules/profile/services';
import { BankInterface } from '@modules/auth/models/merchantProfile.model';
import { BankAccountService } from '@modules/bank-account/services';

@Component({
  selector: 'sbpro-inward-outward-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inward-outward-chart.component.pug',
  styleUrls: ['./inward-outward-chart.component.scss']
})
export class InwardOutwardChartComponent implements OnInit {
  // Initialize with default value
  numPendingTransfers = '';
  pendingTransferAmount = '';
  totalEscrowBalance = '';
  effectiveEscrowBalance = '';
  connectedBanking = false;
  loadingFigures = false;
  isAdmin = false;
  merchantId!: string | null;
  banks!: BankInterface[];
  totalAccountBalance!: string;
  pendingBalance!: string;
  effectiveCastlerBalance!: string;

  // Filters
  @Input() startDate!: Date;
  @Input() endDate!: Date;
  @Input() bankNames!: string[];

  @Input() data = [0, 0, 0, 0, 0, 0];
  @Input() xLabels = ['Jan', 'Feb', 'Apr', 'May', 'Jun'];
  @Input() yMax = 30000;
  @Input() cb!: boolean;

  constructor(
    private chartsService: ChartsService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private merchantProfileService: ProfileService,
    private bankAccountService: BankAccountService
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
    this.merchantId = this.authService.getMerchantId();
  }

  ngOnInit() {
    this.loadingFigures = true;
    if (this.merchantId) {
      this.merchantProfileService.getProfile(null, false).subscribe(resp => {
        this.banks = resp.result.banks;
        if (resp.result.isAccountAddAllowed || resp.result.connectedBanking) {
          this.connectedBanking =
            this.cb !== undefined ? this.cb : resp.result.connectedBanking;
          this.getBalance();
        }
      });
    }
  }

  async getBalance() {
    if (this.connectedBanking && !this.isAdmin) {
      this.bankAccountService
        .getBalance(this.isAdmin, this.merchantId, this.bankNames)
        .subscribe(resp => {
          this.effectiveCastlerBalance = NumberHelper.getInstance().formatCurrency(
            resp.result.totalBalance - resp.result.pendingBalance
          );
          this.totalAccountBalance = NumberHelper.getInstance().formatCurrency(
            resp.result.totalBalance
          );
          this.pendingBalance = NumberHelper.getInstance().formatCurrency(
            resp.result.pendingBalance
          );
          console.log(resp);
          this.loadingFigures = false;
          this.refreshData();
        });
    } else if (!this.connectedBanking || this.isAdmin) {
      this.connectedBanking = false;
      this.refreshData();
    }
  }

  refreshData() {
    const subscribers = [];

    const totalAmountPromise = this.dashboardService.fetchDashboardFigure(
      DashboardService.MODULES.ESCROW,
      DashboardService.SECTIONS.BALANCE,
      {
        bankNames: this.bankNames
        // startDate: this.startDate,
        // endDate: this.endDate
      }
    );
    subscribers.push(totalAmountPromise);

    const pendingAmountPromise = this.dashboardService.fetchDashboardFigure(
      DashboardService.MODULES.OUTWARD_TRANSACTION,
      DashboardService.SECTIONS.TOTAL_AMOUNT,
      {
        statuses: [transferStatus.PENDING, transferStatus.PROCESSING],
        bankNames: this.bankNames
        // startDate: this.startDate,
        // endDate: this.endDate
      }
    );
    subscribers.push(pendingAmountPromise);

    if (!this.isAdmin) {
      const numPendingTransfersPromise = this.dashboardService.fetchDashboardFigure(
        DashboardService.MODULES.OUTWARD_TRANSACTION,
        DashboardService.SECTIONS.COUNT,
        {
          statuses: [transferStatus.PENDING, transferStatus.PROCESSING],
          bankNames: this.bankNames
          // startDate: this.startDate,
          // endDate: this.endDate
        }
      );
      subscribers.push(numPendingTransfersPromise);
    }

    this.loadingFigures = true;
    forkJoin(subscribers).subscribe((resp: any) => {
      this.loadingFigures = false;
      if (resp[1].success) {
        this.pendingTransferAmount = NumberHelper.getInstance().formatCurrency(
          resp[1].result || 0
        );
      }

      if (resp[0].success) {
        let totalAmount = resp[0].result || 0;
        if (resp[1].success && this.isAdmin) {
          totalAmount += resp[1].result || 0;
        }
        this.totalEscrowBalance = NumberHelper.getInstance().formatCurrency(
          totalAmount
        );
        if (this.isAdmin) {
          this.effectiveEscrowBalance = NumberHelper.getInstance().formatCurrency(
            resp[0].result || 0
          );
        }
      }

      if (!this.isAdmin && (resp as any[]).length >= 2 && resp[2]?.success) {
        this.numPendingTransfers = resp[2].result + '';
      }
      this.cdr.detectChanges();
    });
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { ChartsService } from '@modules/charts/services';
import { DashboardResponseModel } from '@modules/dashboard/models/dashboard-response.model';
import { DashboardService } from '@modules/dashboard/services';
import accountStatus from 'config/accountStatus';

import StringHelper from '../../../../helpers/string.helper';

@Component({
  selector: 'sbpro-total-active-account',
  templateUrl: './total-active-account.component.pug',
  styleUrls: ['./total-active-account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TotalActiveAccountComponent implements OnInit {
  loadingBlockedFund = false;
  loadingActiveMerchants = false;

  totalNumberOfActiveAccounts = '';
  totalNumberOfActiveMerchants = -1;
  totalEscrowBalance = '';

  // Filters
  @Input() startDate!: Date;
  @Input() endDate!: Date;
  @Input() bankNames!: string[];

  @Input() dashboardData!: DashboardResponseModel;

  constructor(
    private chartsService: ChartsService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData() {
    this.loadingActiveMerchants = true;
    this.dashboardService
      .fetchDashboardFigure(
        DashboardService.MODULES.MERCHANT,
        DashboardService.SECTIONS.COUNT,
        { bankNames: this.bankNames, verified: true }
      )
      .subscribe(resp1 => {
        this.loadingActiveMerchants = false;

        this.totalNumberOfActiveMerchants = resp1.result;
        this.cdr.detectChanges();
      });

    this.loadingBlockedFund = true;
    this.dashboardService
      .fetchDashboardFigure(
        DashboardService.MODULES.ACCOUNTS,
        DashboardService.SECTIONS.COUNT,
        { status: accountStatus.ACTIVE, bankNames: this.bankNames }
      )
      .subscribe(resp1 => {
        this.loadingBlockedFund = false;

        this.totalNumberOfActiveAccounts = resp1.result.toString();
        this.cdr.detectChanges();
      });
  }
}

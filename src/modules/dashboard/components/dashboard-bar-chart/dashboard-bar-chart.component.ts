import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AuthService } from '@modules/auth/services';
import DashboardFiltersInterface from '@modules/dashboard/interfaces/dashboard-filters.interface';
import { DayWiseStruct } from '@modules/dashboard/models';
import { DashboardService } from '@modules/dashboard/services';
import { ProfileService } from '@modules/profile/services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'sbpro-dashboard-bar-chart',
  templateUrl: './dashboard-bar-chart.component.pug',
  styleUrls: ['./dashboard-bar-chart.component.scss']
})
export class DashboardBarChartComponent implements OnInit {
  @Input() startDate!: Date;
  @Input() endDate!: Date;
  @Input() bankNames!: string[];
  @Input() cb!: boolean;

  dropDownVal = '';
  inwardOutwardDropdown: string[] = [];

  inwardTransactionReport!: DayWiseStruct[];
  outwardTransferReport!: DayWiseStruct[];
  billingReport!: DayWiseStruct[];
  merchantId!: string | null;
  connectedBanking = false;
  loadingData = false;

  onChange(val: Event) {
    // @ts-ignore
    this.dropDownVal = val?.target?.value;
  }

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private merchantProfileService: ProfileService
  ) {
    this.inwardTransactionReport = [
      { id: { day: 2, month: 3, year: 383 }, amount: 48858 } as DayWiseStruct,
      { id: { day: 2, month: 4, year: 383 }, amount: 48858 } as DayWiseStruct,
      { id: { day: 2, month: 5, year: 383 }, amount: 48858 } as DayWiseStruct
    ];
    this.merchantId = this.authService.getMerchantId();
  }

  ngOnInit() {
    this.loadingData = true;
    if (this.merchantId) {
      this.merchantProfileService.getProfile(null).subscribe(resp => {
        if (resp.result.isAccountAddAllowed || resp.result.connectedBanking) {
          this.connectedBanking =
            this.cb !== undefined ? this.cb : resp.result.connectedBanking;
        }

        if (this.connectedBanking) {
          this.dropDownVal = 'Total Deposits';
          this.inwardOutwardDropdown = ['Total Deposits', 'Total Transfers'];
          this.refreshData();
        } else {
          this.dropDownVal = 'Total Inward Fund Deposit';
          this.inwardOutwardDropdown = [
            'Total Inward Fund Deposit',
            'Total Outward Fund Transfer',
            'Total Billing'
          ];
          if (!this.authService.isAdmin() && !this.authService.isSuperAdmin()) {
            this.inwardOutwardDropdown.splice(2, 1);
          }
          this.refreshData();
        }
      });
    }
    // this.refreshData();
  }

  refreshData(
    filters: Partial<
      DashboardFiltersInterface
    > = {} as DashboardFiltersInterface
  ) {
    // Adjust filters
    if (filters.startDate) this.startDate = filters.startDate;
    if (filters.endDate) this.endDate = filters.endDate;
    if (filters.bankNames) this.bankNames = filters.bankNames;

    // We'll create observables collection
    // before going to hit the api
    const observables = [];
    observables.push(
      this.dashboardService.fetchDashboardDayWiseData('transaction', {
        startDate: this.startDate,
        endDate: this.endDate,
        bankNames: this.bankNames,
        connectedBanking: this.connectedBanking
      })
    );
    observables.push(
      this.dashboardService.fetchDashboardDayWiseData('transfer', {
        startDate: this.startDate,
        endDate: this.endDate,
        bankNames: this.bankNames,
        connectedBanking: this.connectedBanking
      })
    );
    observables.push(
      this.dashboardService.fetchDashboardDayWiseData('bills', {
        startDate: this.startDate,
        endDate: this.endDate,
        bankNames: this.bankNames
      })
    );

    // Now we've all the set of observables prepared
    // Now we will hit the api server simultaneously
    this.loadingData = true;
    forkJoin(observables).subscribe(
      ([resp1, resp2, resp3]) => {
        this.loadingData = false;
        // console.log('Found following data from observables..');
        // console.log(resp);

        // First will be transaction
        this.inwardTransactionReport = resp1.result;

        // Second will be transfer
        this.outwardTransferReport = resp2.result;

        // Third will be bills
        this.billingReport = resp3.result;

        this.cdr.detectChanges();
      },
      error => {
        // This block will only be executed if all requests fail
        console.error('All requests failed:', error);
      }
    );
  }
}

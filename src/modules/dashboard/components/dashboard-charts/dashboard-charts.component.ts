import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { AuthService } from '@modules/auth/services/auth.service';
import { DashboardBarChartComponent } from '@modules/dashboard/components/dashboard-bar-chart/dashboard-bar-chart.component';
import { DashboardCardsComponent } from '@modules/dashboard/components/dashboard-cards/dashboard-cards.component';
import {
  DashboardResponseModel,
  DashboardTopResponseModel
} from '@modules/dashboard/models/dashboard-response.model';
import { Dates } from '@modules/dashboard/models/dashboard.model';
import { DashboardService } from '@modules/dashboard/services/dashboard.service';
import moment from 'moment';
import { Subject } from 'rxjs';

@Component({
  selector: 'sbpro-dashboard-charts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-charts.component.pug',
  styleUrls: ['dashboard-charts.component.scss']
})
export class DashboardChartsComponent implements OnInit {
  @Input() bankNames!: string[];
  @Input() cb!: boolean;

  @ViewChild('dashboardCards') dashboardCards!: DashboardCardsComponent;
  @ViewChild('barCharts') barCharts!: DashboardBarChartComponent;

  flag: Subject<boolean> = new Subject<boolean>();
  alwaysShowCalendars!: boolean;

  datesObject!: Dates;
  today!: moment.Moment;
  inwardOutwardDropdown: string[] = [
    'Total Inward Fund Deposit',
    'Total Outward Fund Transfer',
    'Total Billing'
  ];
  dropDownVal = 'Total Inward Fund Deposit';
  waitForData = false;
  waitForDataTop = false;
  screenHeight!: number;
  screenWidth!: number;
  isAdmin = false;
  dashboardData!: DashboardResponseModel;
  dashboardDataTop!: DashboardTopResponseModel;

  startDate!: Date;
  endDate!: Date;

  ranges = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [
      moment()
        .subtract(1, 'month')
        .startOf('month'),
      moment()
        .subtract(1, 'month')
        .endOf('month')
    ]
  };

  selected = {
    startDate: moment().subtract(30, 'days'),
    endDate: moment()
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {
    this.isAdmin = this.authService.isSuperAdmin();

    this.today = moment().endOf('day');

    // this.selected.startDate = moment()
    //   .subtract(30, 'days')
    //   .startOf('day');
    // this.selected.endDate = this.today.clone();
  }

  ngOnInit() {
    if (!this.isAdmin) {
      this.inwardOutwardDropdown.splice(2, 1);
    }

    this.datesObject = {
      startDate: moment().subtract(1, 'days'),
      endDate: moment()
    };

    this.startDate = this.datesObject.startDate.toDate();
    this.endDate = this.datesObject.endDate.toDate();

    this.waitForDataTop = true;
  }

  datesUpdated(event: object | Dates) {
    const parsedEvent = event as Dates;

    let demo!: Dates;
    if (parsedEvent.startDate !== null && parsedEvent.endDate !== null) {
      demo = {
        startDate: parsedEvent.startDate,
        endDate: parsedEvent.endDate
      };
      this.startDate = demo.startDate.toDate();
      this.endDate = demo.endDate.toDate();
    } else {
      demo = {
        startDate: this.selected.startDate,
        endDate: this.selected.endDate
      };
      this.startDate = demo.startDate.toDate();
      this.endDate = demo.endDate.toDate();
    }

    this.dashboardCards?.refreshDataNew({
      startDate: this.startDate,
      endDate: this.endDate,
      bankNames: this.bankNames
    });

    this.barCharts?.refreshData({
      startDate: this.startDate,
      endDate: this.endDate,
      bankNames: this.bankNames
    });

    this.cdr.detectChanges();
  }

  onChange(val: Event) {
    // @ts-ignore
    this.dropDownVal = val?.target?.value;
  }
}

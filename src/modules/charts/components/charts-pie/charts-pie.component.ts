import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@modules/auth/services';
import { BankAccount } from '@modules/bank-account/models';
import { BankAccountService } from '@modules/bank-account/services';
import { ChartsService } from '@modules/charts/services';
import { Dates, EscrowAccounts } from '@modules/dashboard/models';
import { DashboardTopResponseModel } from '@modules/dashboard/models/dashboard-response.model';
import { DashboardService } from '@modules/dashboard/services';
import { ProfileService } from '@modules/profile/services';
import Chart from 'chart.js';
import moment from 'moment';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import NumberHelper from '../../../../helpers/number.helper';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';

@Component({
  selector: 'sb-charts-pie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './charts-pie.component.pug',
  styleUrls: ['charts-pie.component.scss']
})
export class ChartsPieComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChartRef') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @Input() accountsTable!: TemplateRef<any>;
  @Input() height = '200px';
  @Input() width!: string;

  // data: number[] = [0, 0, 0, 0, 0];
  // labels: string[] = [];
  // loading = true;
  pieChart!: Chart;
  datesObject!: Dates;
  changeLabelOrientation = true;
  screenHeight!: number;
  screenWidth!: number;
  // check = true;
  connectedBanking = false;
  isAdmin = false;
  merchantId!: string | null;
  banks!: string;
  // all = false;

  coloursAll = [
    'rgb(195,55,100)',
    'rgb(244,226,216)',
    'rgb(255,195,113)',
    'rgb(109,213,237)',
    'rgb(54,179,126)',
    'rgb(210, 245, 60)',
    'rgb(250, 190, 212)',
    'rgb(220, 190, 255)',
    'rgb(170, 110, 40)',
    'rgb(128, 0, 0)',
    'rgb(255, 215, 180)'
  ];

  @Input() dashboardData!: DashboardTopResponseModel;
  @Input() startDate!: Date;
  @Input() endDate!: Date;
  @Input() bankNames!: string[];
  @Input() cb!: boolean;
  bankAccounts$!: Observable<BankAccount[]>;
  accountNo: string[] = [];
  bankAccountNo!: string;
  loadingData = false;
  merchantProfile?: MerchantProfile | null;

  constructor(
    private chartsService: ChartsService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private merchantProfileService: ProfileService,
    private bankAccountService: BankAccountService
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
    this.merchantId = this.authService.getMerchantId();
  }

  ngAfterViewInit(): void {}

  ngOnInit() {
    this.loadingData = true;

    if (this.merchantId) {
      this.merchantProfile = this.authService.getMerchantProfile();
      if (this.merchantProfile){
        if (this.merchantProfile.isAccountAddAllowed || this.merchantProfile.connectedBanking) {
          this.connectedBanking =
            this.cb !== undefined ? this.cb : this.merchantProfile.connectedBanking;
        }
        if (!this.connectedBanking || this.isAdmin) {
          this.connectedBanking = false;
          this.fetchData();
        } else if (this.connectedBanking && !this.isAdmin) {
          this.fetchConnectedBankingData();
        }
        this.cdr.detectChanges();
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResizeScreen() {
    if (this.pieChart && this.pieChart.canvas) {
      // @ts-ignore
      this.pieChart.options.legend?.position =
        this.pieChart.canvas.width < 400 ? 'top' : 'left';
    }
  }

  fetchData() {
    this.loadingData = true;

    this.dashboardService
      .fetchDashboardAccounts(
        {
          startDate: this.startDate,
          endDate: this.endDate,
          bankNames: this.bankNames
        },
        { balance: -1 }
      )
      .subscribe((resp: { result: EscrowAccounts[] }) => {
        this.loadingData = false;
        this.cdr.detectChanges();

        if (resp.result && resp.result.length > 0) {
          const data = [] as number[];
          const labels = [] as string[];
          const colors = [] as string[];

          resp.result.forEach((item: EscrowAccounts, index: number) => {
            if (!item.accountBalance) return;
            data.push(item.accountBalance);

            if (item.accountName.length > 12) {
              item.accountName = item.accountName.substring(0, 12) + '...';
            }

            labels.push(
              `${
                item.accountName
              } : ${NumberHelper.getInstance().formatCurrency(
                item.accountBalance,
                { maximumFractionDigits: 0 }
              )}`
            );

            colors.push(this.coloursAll[index]);
          });

          if (this.pieChart) {
            this.pieChart.destroy();
          }

          this.initializePieChart(
            this.pieChart &&
              this.pieChart.canvas &&
              this.pieChart.canvas?.width < 400
              ? 'top'
              : 'left',
            labels,
            data,
            colors
          );
          this.cdr.detectChanges();
        }
      });
  }

  Navigate() {
    const isAdmin: boolean = this.authService.isSuperAdmin();
    if (isAdmin) {
      this.router.navigateByUrl('super-admin/escrow/form');
    } else {
      this.router.navigateByUrl(`${environment.urlPortalPrefix}/escrow/form`);
    }
  }

  initializePieChart(
    legendOrientation: 'left' | 'top' = 'top',
    labels: string[],
    data: number[],
    colors: any
  ) {
    if (!this.pieChartRef) return;

    this.pieChart = new this.chartsService.Chart(
      this.pieChartRef.nativeElement,
      {
        type: 'pie',
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: colors,
              hoverBackgroundColor: colors,
              hoverBorderColor: colors
            }
          ]
        },
        // @ts-ignore
        options: {
          maintainAspectRatio: false,
          tooltips: {
            backgroundColor: 'rgb(255,255,255)',
            bodyFontColor: '#858796',
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            caretPadding: 10,
            callbacks: {
              label: (tooltipItem, chartData) => {
                // tslint:disable-next-line:no-non-null-assertion
                const index: number = tooltipItem?.index!;

                // tslint:disable-next-line:no-non-null-assertion
                return chartData.labels![index];
              }
            }
          },
          legend: {
            labels: {
              padding: 15,
              fontColor: '#417505',
              fontSize: 14,
              fontFamily: 'Arial'
            },
            position: legendOrientation,
            display: true
          },
          cutoutPercentage: 0
        }
      }
    );
  }

  fetchConnectedBankingData() {
    this.loadingData = true;

    this.bankAccountService
      .retrieveBankAccounts(
        this.isAdmin,
        this.merchantId,
        { page: 1 },
        this.bankNames,
        { balance: -1 }
      )
      .subscribe(resp => {
        this.loadingData = false;
        this.cdr.detectChanges();

        if (resp && resp.length > 0) {
          // this.accountNo = [];
          // this.bankAccountService.updateBankAccountNo(
          //   resp[0]?.bankAccountNo?.toString()
          // );

          const data = [] as number[];
          const labels = [] as string[];
          const colors = [] as string[];

          for (let i = 0; i < resp.length; i++) {
            const bankAccount = resp[i];
            this.accountNo.push(bankAccount.bankAccountNo);
            data.push(bankAccount.balance);

            if (bankAccount.bankAccountNo > 12) {
              bankAccount.bankAccountNo =
                bankAccount.bankAccountNo.substring(0, 12) + '...';
            }

            labels.push(
              `${
                bankAccount.bankAccountNo
              } : ${NumberHelper.getInstance().formatCurrency(
                bankAccount.balance,
                { maximumFractionDigits: 0 }
              )}`
            );

            colors.push(this.coloursAll[i]);
          }

          if (this.pieChart) {
            this.pieChart.destroy();
          }

          this.initializePieChart(
            this.pieChart &&
              this.pieChart.canvas &&
              this.pieChart.canvas?.width < 400
              ? 'top'
              : 'left',
            labels,
            data,
            colors
          );

          this.cdr.detectChanges();
        } else console.log('No data found for pie chart');
      });

    this.datesObject = {
      startDate: moment().subtract(5, 'months'),
      endDate: moment()
    };

    if (this.bankNames) {
      if (this.bankNames.length !== 1 || this.bankNames[0] === 'All Bank') {
        this.banks = 'All Banks';
      }
      if (this.bankNames.length === 1 && this.bankNames[0] !== 'All Banks') {
        this.banks = this.bankNames[0];
      }
    }
  }

  onChange(event: any) {
    this.bankAccountService.updateBankAccountNo(event.target.value);
  }
}

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { ChartsService } from '@modules/charts/services';
import { Dates, DayWiseStruct } from '@modules/dashboard/models';
import { DashboardService } from '@modules/dashboard/services';
import Chart from 'chart.js';
import { Subject } from 'rxjs';

@Component({
  selector: 'sbpro-billings-charts',
  templateUrl: './billings-charts.component.pug',
  styleUrls: ['./billings-charts.component.scss']
})
export class BillingsChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('myBarChart') myBarChart!: ElementRef<HTMLCanvasElement>;
  @Input() height = '300px';
  @Input() width!: string;
  chart!: Chart;
  @Input() label = 'Amount';
  @Input() parentSubject!: Subject<any>;
  @Input() flag!: Subject<boolean>;
  datesObject!: Dates;
  lengthOfLabels = 0;
  dataFromParent = true;
  @Input() reportData!: DayWiseStruct[];
  months = [
    'NaN',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  @Input() data = [0, 0, 0, 5000, 0, 0];
  @Input() xLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  @Input() yMax = 30000;

  constructor(
    private chartsService: ChartsService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  // ngAfterViewInit(): void {
  //   this.parentSubject.subscribe(val => {
  //     // console.log("DYNAMIC DATA FROM PARENT ",val[0]);
  //     this.datesObject = val[1];
  //     this.checkBeforeCall(val[0]);
  //     this.cdr.detectChanges();
  //   });
  //   // if (this.flag) {
  //   //   // console.log("jcnweonewon");
  //   //   // to call first time when chart loads....
  //   this.datesObject = {
  //     startDate: moment().subtract(5, 'months'),
  //     endDate: moment()
  //   };
  //   this.fetchData();
  // }

  ngOnInit() {}

  ngAfterViewInit() {
    if (!this.reportData || this.reportData.length === 0) {
      console.error('No data found to initialize chart');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    let flag = false;
    if (this.reportData[0].id) {
      flag = true;
    }
    this.prepareChart(this.reportData, flag);
  }

  fetchData() {
    // First time data will be given from parent, with data change data will called from API.
    if (this.dataFromParent) {
      const resp = this.reportData;
      this.checkBeforeCall(this.reportData);
      this.dataFromParent = false;
    }
  }

  checkBeforeCall(resp: DayWiseStruct[]) {
    // if (
    //   this.datesObject.startDate.toDate().getMonth() ===
    //     this.datesObject.endDate.toDate().getMonth() &&
    //   this.datesObject.startDate.toDate().getFullYear() ===
    //     this.datesObject.endDate.toDate().getUTCFullYear()
    // ) {
    if (this.chart) {
      this.chart.destroy();
    }
    this.prepareChart(resp, false);
    // } else {
    //   if (this.chart) {
    //     this.chart.destroy();
    //   }
    //   this.dumped(resp, resp.result.billedDetailsMonthWise, false);
    // }
  }

  prepareChart(arr: any[], flag: boolean) {
    if (arr.length > 0) {
      this.data = [];
      this.xLabels = [];
      this.lengthOfLabels = arr.length;
      if (flag) {
        arr.forEach((item: DayWiseStruct) => {
          this.xLabels.push(`${item.id.day}-${this.months[item.id.month]}`);
          this.data.push(item.amount);
        });
      } else {
        arr.forEach((item: any) => {
          this.xLabels.push(item.monthName);
          this.data.push(item.amount);
        });
      }
      this.yMax = Math.max.apply(Math, this.data);
      if (this.chart) {
        this.chart.destroy();
      }
      this.initializeChart();
      this.cdr.detectChanges();
    } else {
      if (this.chart) {
        this.chart.destroy();
        this.data = [0, 0, 0, 0, 0, 0];
        this.xLabels = ['Jan', 'Feb', 'Apr', 'May', 'Jun'];
        this.yMax = 30000;
        this.lengthOfLabels = 4;
      }
      this.initializeChart();
      this.cdr.detectChanges();
    }
  }

  initializeChart() {
    this.chart = new this.chartsService.Chart(this.myBarChart.nativeElement, {
      type: 'line',
      data: {
        labels: this.xLabels,
        datasets: [
          {
            label: this.label,
            backgroundColor: '#FFEAC3',
            hoverBackgroundColor: '#F2C94C',
            borderColor: '#F2C94C',
            data: this.data,
            maxBarThickness: 25,
            fill: true
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 10,
            right: 25,
            top: 25,
            bottom: 0
          }
        },
        scales: {
          xAxes: [
            {
              time: {
                unit: 'month'
              },
              gridLines: {
                display: false,
                drawBorder: false
              },
              ticks: {
                maxTicksLimit: this.lengthOfLabels
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                min: 0,
                // max: this.yMax,
                maxTicksLimit: this.lengthOfLabels,
                padding: 10,
                // Include a dollar sign in the ticks
                callback: (value, index, values) => {
                  return value.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 0
                  });
                }
              },
              gridLines: {
                color: 'rgb(234, 236, 244)',
                zeroLineColor: 'rgb(234, 236, 244)',
                drawBorder: false,
                borderDash: [2],
                zeroLineBorderDash: [2]
              }
            }
          ]
        },
        legend: {
          display: false
        },
        tooltips: {
          titleMarginBottom: 10,
          titleFontColor: '#6e707e',
          titleFontSize: 14,
          backgroundColor: 'rgb(255,255,255)',
          bodyFontColor: '#858796',
          borderColor: '#dddfeb',
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          caretPadding: 10,
          callbacks: {
            label: (tooltipItem, chart) => {
              let datasetLabel = '';
              if (chart && chart.datasets) {
                datasetLabel = chart.datasets[
                  tooltipItem.datasetIndex as number
                ].label as string;
              }
              return (
                datasetLabel +
                ': ' +
                (tooltipItem.yLabel as number).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0
                })
              );
            }
          }
        }
      }
    });
  }
}

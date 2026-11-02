import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { ActivityLogsService } from '@modules/activity-logs/services';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';

@Component({
  selector: 'sbpro-logs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logs.component.pug',
  styleUrls: ['logs.component.scss']
})
export class LogsComponent implements OnInit {
  @Input() accountId = '';
  startDate!: NgbDateStruct;
  endDate!: NgbDateStruct;
  modalRef?: NgbModalRef;
  maxDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getUTCDate()
  };
  data: [] | undefined;
  isLoading = false;
  page = 1;
  pageSize = 10;
  isAdmin = true;
  total$!: number;
  searchTerm = '';
  errors: string[] = [];
  type: string = '';
  logDetails: {} | undefined;

  @ViewChild('details', { static: true }) details?: ElementRef;
  constructor(
    public activityLogService: ActivityLogsService,
    private calendar: NgbCalendar,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private router: Router,
    private dateParser: NgbDateParserService,
    private utilityService: UtilityService
  ) {}

  ngOnInit() {
    const params = { page: this.page };
    this.getLogs(params);
  }

  //Call getLogs() from activity logger service to fetch all activity logs
  getLogs(params: object) {
    this.data = [];
    let vaId = this.accountId ? this.accountId : '';
    this.isLoading = true;
    this.activityLogService.getLogs('', vaId, params).subscribe((resp: any) => {
      console.log('logs', resp);
      if (resp.success) {
        this.data = resp.result;
        this.total$ = resp.allItemsCount;
        this.isLoading = false;
        this.cdr.detectChanges();
      } else {
        this.errors = resp.errors;
        this.cdr.detectChanges();
      }
    });
    console.log(this.accountId);
  }

  // //clears all search filters
  // clearForm() {
  //   console.log('clearing form');
  //   this.activityLogService.page = 1;
  //   this.activityLogService.dateFrom = this.calendar.getNext(
  //     new NgbDate(0, 0, 0),
  //     'd',
  //     0
  //   );
  //   this.activityLogService.dateTo = this.calendar.getNext(
  //     new NgbDate(0, 0, 0),
  //     'd',
  //     0
  //   );
  //   this.activityLogService.s = '';
  // }

  //Fetch activity logs according to the search filters
  filterData() {
    console.log('FILTERING DATA ');
    const params: any = {};
    if (this.startDate?.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this.startDate)
      ).toISOString();
    }
    if (this.endDate?.year > 2010) {
      //add a day to dateTo
      const newDate = this.utilityService.getNextDayFromNgb(this.endDate);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }
    if (this.searchTerm.length > 0) {
      params.s = this.searchTerm.trim();
    }
    this.page = 1;
    console.log('PARAMS ', params);
    this.getLogs(params);
  }

  //get all activity logs based on page number
  pageChange(event: any) {
    console.log('PAGE ', this.page);
    console.log('PAGE EVENT ', event);

    const params: any = { page: this.page };
    this.getLogs(params);
    this.cdr.detectChanges();
  }

  //Clear all search filters
  clearButtonClick() {
    this.searchTerm = '';
    // @ts-ignore
    this.startDate = null;
    // @ts-ignore
    this.endDate = null;

    this.page = 1;
    this.getLogs({ page: 1 });
    this.cdr.detectChanges();
  }

  //show log data details of a log
  showDetails(log: any) {
    console.log(log);
    this.type = log.action;
    this.logDetails = log;
    this.modalRef = this.modalService.open(this.details, {
      backdrop: 'static',
      size: 'lg'
    });
    console.log(this.type);
    this.cdr.detectChanges();
  }

  //Close details modal
  closeModal() {
    this.modalRef?.close();
  }

  //Call closeModal() and refresh log table
  setModalClose(flag: boolean) {
    if (flag) {
      this.closeModal();
    }
    let params = {
      page: 1
    };
    if (this.accountId) {
      Object.assign(params, { accountId: this.accountId });
    }
    this.getLogs(params);
  }

  //redirect to virtual account details page
  accountDetails(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/account/' + id]);
  }

  public toIST(dateStr: string) {
    return this.utilityService
      .parseByTimeZone(dateStr, 'Asia/Kolkata')
      .format('MMM DD, YYYY, hh:mm:ss A');
  }
}

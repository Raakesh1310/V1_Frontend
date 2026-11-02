import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from '@common/services';
import { SortEvent } from '@modules/tables/directives';
import { LoginLockLogsInterface } from '@modules/users/models/lockLogs.model';
import { LockLogsService } from '@modules/users/services/lockLogs.service';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

@Component({
  selector: 'sbpro-user-logs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-logs.component.pug',
  styleUrls: ['user-logs.component.scss']
})
export class UserLogsComponent implements OnInit {
  @Input() private userId = '';

  @Input() pageSize = 10;
  model!: NgbDateStruct;
  lockLogs$!: Observable<LoginLockLogsInterface[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  reportDownloadLink$!: Observable<string>;

  constructor(
    public lockLogsService: LockLogsService,
    public changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private calendar: NgbCalendar,
    private modalService: NgbModal,
    private utilityService: UtilityService,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {
    // this.accountsService.retrieveData();
    // this.accountsService.performSearch();
    this.lockLogsService.pageSize = this.pageSize;
    this.lockLogs$ = this.lockLogsService.loginLockLogs$;
    this.total$ = this.lockLogsService.total$;
    this.reportDownloadLink$ = this.lockLogsService.reportDownloadLink$;
    this.loadData();
    // this.allUsersService.changeLocks('4234234', 'attach_lock');
  }

  loadData() {
    this.lockLogsService.performSearch(this.userId);
  }

  clearForm() {
    console.log('clearing form');
    // tslint:disable-next-line:no-any
    this.lockLogsService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    // tslint:disable-next-line:no-any
    this.lockLogsService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.lockLogsService.pageSize = 10;
    this.lockLogsService.searchTerm = '';

    this.loadData();
    let dNow = new Date();
    this.lockLogsService.dateFromMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.lockLogsService.dateToMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.changeDetectorRef.detectChanges();
  }

  submitSearchForm() {
    console.log('Submitting Search Form');
    // Reload the data
    this.lockLogsService.retrieveData();
  }

  onSort({ column, direction }: SortEvent) {
    this.sortedColumn = column;
    this.sortedDirection = direction;
    this.lockLogsService.sortColumn = column;
    this.lockLogsService.sortDirection = direction;
    this.changeDetectorRef.detectChanges();
  }
}

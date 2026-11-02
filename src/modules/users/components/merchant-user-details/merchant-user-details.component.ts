import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { SortEvent } from '@modules/tables/directives';
import { MerchantUserInterface } from '@modules/users/models/user-merchant-user.model';
import { MerchantUserService } from '@modules/users/services/merchantUser.service';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

@Component({
  selector: 'sbpro-merchant-user-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './merchant-user-details.component.pug',
  styleUrls: ['merchant-user-details.component.scss']
})
export class MerchantUserDetailsComponent implements OnInit {
  @Input() private userId = '';

  @Input() pageSize = 10;
  model!: NgbDateStruct;
  merchantUsers$!: Observable<MerchantUserInterface[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  reportDownloadLink$!: Observable<string>;

  constructor(
    public merchantUserService: MerchantUserService,
    public changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private calendar: NgbCalendar
  ) {}

  ngOnInit() {
    // this.accountsService.retrieveData();
    // this.accountsService.performSearch();
    this.merchantUserService.pageSize = this.pageSize;
    this.merchantUsers$ = this.merchantUserService.merchantUsers$;
    this.total$ = this.merchantUserService.total$;
    this.reportDownloadLink$ = this.merchantUserService.reportDownloadLink$;
    this.loadData();
    // this.allUsersService.changeLocks('4234234', 'attach_lock');
  }

  clearForm() {
    console.log('clearing form');
    // tslint:disable-next-line:no-any
    this.merchantUserService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    // tslint:disable-next-line:no-any
    this.merchantUserService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.merchantUserService.pageSize = 10;
    this.merchantUserService.searchTerm = '';

    this.loadData();
    let dNow = new Date();
    this.merchantUserService.dateFromMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.merchantUserService.dateToMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.changeDetectorRef.detectChanges();
  }

  loadData() {
    this.merchantUserService.performSearch(this.userId);
  }

  submitSearchForm() {
    console.log('Submitting Search Form');
    // Reload the data
    this.merchantUserService.retrieveData();
  }

  onSort({ column, direction }: SortEvent) {
    this.sortedColumn = column;
    this.sortedDirection = direction;
    this.merchantUserService.sortColumn = column;
    this.merchantUserService.sortDirection = direction;
    this.changeDetectorRef.detectChanges();
  }
}

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
import { SortEvent } from '@modules/tables/directives/sortable.directive';
import { User } from '@modules/users/models';
import { AllUsersService } from '@modules/users/services/allusers.service';
import { NgbCalendar, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'sbpro-list-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list-user.component.pug',
  styleUrls: ['list-user.component.scss']
})
export class ListUserComponent implements OnInit {
  @Input() pageSize = 8;
  model!: NgbDateStruct;
  users$!: Observable<User[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  reportDownloadLink$!: Observable<string>;

  constructor(
    public allUsersService: AllUsersService,
    public changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private calendar: NgbCalendar,
    private modalService: NgbModal,
    private utilityService: UtilityService,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {
    this.allUsersService.pageSize = this.pageSize;
    this.users$ = this.allUsersService.users$;
    this.total$ = this.allUsersService.total$;
    this.reportDownloadLink$ = this.allUsersService.reportDownloadLink$;
    this.loadData();
  }

  loadData() {
    this.allUsersService.performSearch();
  }

  submitSearchForm() {
    console.log('Submitting Search Form');
    // Reload the data
    this.allUsersService.retrieveData();
  }

  clearForm() {
    console.log('clearing form');
    // tslint:disable-next-line:no-any
    this.allUsersService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    // tslint:disable-next-line:no-any
    this.allUsersService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.allUsersService.pageSize = 10;
    this.allUsersService.searchTerm = '';

    this.loadData();
    let dNow = new Date();
    this.allUsersService.dateFromMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.allUsersService.dateToMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.changeDetectorRef.detectChanges();
  }

  updateStatus(id: string, status: boolean) {
    this.allUsersService.updateUserStatus(id, status).subscribe(
      resp => {
        if (resp.success) {
          // Redirect
          this.ngOnInit();
        } else {
          this.ngOnInit();
        }
        // Show error
      },
      error => {
        console.log(error);
      }
    );
  }

  showDetails(userId: string) {
    console.log(userId);
    this.router.navigate([environment.urlAdminPrefix + '/all-users/' + userId]);
  }

  onSort({ column, direction }: SortEvent) {
    this.sortedColumn = column;
    this.sortedDirection = direction;
    this.allUsersService.sortColumn = column;
    this.allUsersService.sortDirection = direction;
    this.changeDetectorRef.detectChanges();
  }
}

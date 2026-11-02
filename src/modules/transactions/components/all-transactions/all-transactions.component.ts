import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DATE_DIFFERENTIAL_IN_MONTH } from '@common/constants/common.constant';
import { UtilityService } from '@common/services';
import { dateMonthDifference } from '@common/services/dateMonthDifference';
import { AuthService } from '@modules/auth/services';
import { Transaction } from '@modules/transactions/models';
import { TransactionService } from '@modules/transactions/services';
import { AllUsersService } from '@modules/users/services/allusers.service';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import merchantUserRoles from 'config/merchantUserRoles';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sbpro-all-transactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './all-transactions.component.pug',
  styleUrls: ['all-transactions.component.scss']
})
export class AllTransactionsComponent implements OnInit {
  @Input() pageSize = 8;
  model!: NgbDateStruct;
  transactions$!: Observable<Transaction[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  virtualIdList!: Observable<string[]>;
  private _loadingList$ = new BehaviorSubject(false);

  filtersVisible = true;
  roles: string[] = [];
  isTrustee = false;

  constructor(
    public userService: AllUsersService,
    public transactionService: TransactionService,
    public changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private calendar: NgbCalendar,
    private utilityService: UtilityService,
    private authService: AuthService
  ) {
    this.transactionService.isSuperAdmin = true;
    // this.transactionService.getSearchDrowpdownValues().subscribe();
    // this.virtualIdList = transactionService.getVirtualIdList$;
    this.roles = this.authService.getRole();
    this.isTrustee =
      this.roles?.indexOf(merchantUserRoles.TRUSTEE) > -1 ? true : false;
  }

  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  toggleFilters() {
    this.filtersVisible = !this.filtersVisible;
  }

  ngOnInit() {
    // this.accountsService.retrieveData();
    // this.accountsService.performSearch();
    this.transactionService.pageSize = this.pageSize;
    this.transactions$ = this.transactionService.transaction$;
    this.total$ = this.transactionService.total$;

    this.transactionService.transaction$.subscribe(() => {
      this._loadingList$.next(false);
    });
    const { dateFrom, dateTo } = dateMonthDifference(
      new Date(),
      DATE_DIFFERENTIAL_IN_MONTH
    );
    this.transactionService.dateFrom = new NgbDate(
      dateFrom.year,
      dateFrom.month,
      dateFrom.day
    );
    this.transactionService.dateTo = new NgbDate(
      dateTo.year,
      dateTo.month,
      dateTo.day
    );

    this.loadData();
  }

  refreshData() {
    this._loadingList$.next(true);
    console.log('Loading data');
    this.transactionService.performRefreshSuperAdmin();
  }

  loadData() {
    this._loadingList$.next(true);
    console.log('Loading data');
    this.transactionService.performSearchSuperAdmin();
  }

  submitSearchForm() {
    console.log('Submitting Search Form');
    this.transactionService.performSearchSuperAdmin();
  }

  clearForm() {
    const dNow = new Date();

    // tslint:disable-next-line:no-any
    (this.transactionService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    )),
      // tslint:disable-next-line:no-any
      (this.transactionService.dateTo = this.calendar.getNext(
        new NgbDate(0, 0, 0),
        'd',
        0
      )),
      (this.transactionService.pageSize = 10);

    this.transactionService.dateFromMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.transactionService.dateToMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.transactionService.searchTerm = '';
    this.transactionService.bank = '';
    // this.transactionService.accountId = '';
    // this.transactionService.transactionId = '';
    this.router.navigate([environment.urlAdminPrefix + '/transaction']);
    this.loadData();

    this.changeDetectorRef.detectChanges();
  }

  showDetails(userId: string) {
    this.userService.findUser(userId).subscribe(res => {
      try {
        const user = res.result;

        console.log(user);
        this.router
          .navigateByUrl('/users', {
            state: { user, isUpdate: false }
          })
          .then(r => {});
      } catch (e) {}
    });
  }
  showTransactionDetails(transactionId: string) {
    this.router.navigate([
      environment.urlAdminPrefix + '/transaction/' + transactionId
    ]);
  }
  openMerchantDetails(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/merchant/' + id]);
  }
  openAccountDetails(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/escrow/' + id]);
  }

  public toINR(number: number) {
    let updated = this.utilityService.toINR(number);
    return updated;
  }
}

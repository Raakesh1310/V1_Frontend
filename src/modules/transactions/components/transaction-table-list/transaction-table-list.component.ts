import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { Router } from '@angular/router';
import { DATE_DIFFERENTIAL_IN_MONTH } from '@common/constants/common.constant';
import { UtilityService } from '@common/services';
import { dateMonthDifference } from '@common/services/dateMonthDifference';
import { Account } from '@modules/accounts/models';
import {
  SBSortableHeaderDirective,
  SortEvent
} from '@modules/transactions/directives';
import { Transaction } from '@modules/transactions/models';
import { TransactionService } from '@modules/transactions/services';
import {
  NgbCalendar,
  NgbDate
} from '@ng-bootstrap/ng-bootstrap';
import * as date from 'date-and-time';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sbpro-transaction-table-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-table-list.component.pug',
  styleUrls: ['transaction-table-list.component.scss']
})
export class TransactionTableListComponent implements OnInit, OnDestroy {
  @Input() pageSize = 4;

  transaction$!: Observable<Transaction[]>;
  accounts$!: Observable<Account[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  clearForm = false;
  selectedTransaction = null;
  showDetail = false;

  @ViewChildren(SBSortableHeaderDirective) headers!: QueryList<
    SBSortableHeaderDirective
  >;

  constructor(
    public router: Router,
    public transactionService: TransactionService,
    // private accountService: AccountsService,
    public changeDetectorRef: ChangeDetectorRef,
    private calendar: NgbCalendar,
    private utilityService: UtilityService
  ) { }

  ngOnInit() {
    this.transactionService.pageSize = this.pageSize;
    this.transaction$ = this.transactionService.transaction$;
    // this.accounts$ = this.accountService.account$;
    this.total$ = this.transactionService.total$;
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
    this.transactionService.performSearch();
    this.updateAccount('');
  }

  updateAccount($event: string) {
    console.log('update request received');
    this.transactionService.account = $event;
  }

  // tslint:disable-next-line:no-any
  selectTransaction(transaction: any) {
    this.showDetail = true;
    this.selectedTransaction = transaction;
    this.changeDetectorRef.detectChanges();
    console.log(this.selectedTransaction);
  }

  showDetails(id: string) {
    this.router
      .navigate([environment.urlPortalPrefix + '/transaction/' + id])
      .then(r => r);
  }

  goBack() {
    this.showDetail = false;
    this.selectedTransaction = null;
    this.changeDetectorRef.detectChanges();
  }

  clearSearchForm() {
    this.clearForm = false;
    this.transactionService.searchTerm = '';
    this.updateAccount('');
    this.transactionService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.transactionService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.transactionService.performSearch();
  }

  submitSearchForm() {
    this.clearForm = true;
    console.log('Submitting Search Form');

    // Reload the data
    this.transactionService.performSearch();
  }

  onSort({ column, direction }: SortEvent) {
    this.sortedColumn = column;
    this.sortedDirection = direction;
    this.transactionService.sortColumn = column;
    this.transactionService.sortDirection = direction;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Method is use to download file.
   * @param data - Array Buffer data
   * @param type - type of the document.
   */
  // tslint:disable-next-line:no-any
  downLoadFile(data: any, type: string) {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const pwa = window.open(url);
    if (!pwa || pwa.closed || typeof pwa.closed === 'undefined') {
      alert('Please disable your Pop-up blocker and try again.');
    }
  }

  getParsedDate(inputDate: Date) {
    if (!inputDate) {
      return '';
    }
    const d = new Date(inputDate);
    return date.format(d, 'DD-MMM-YYYY');
  }

  ngOnDestroy() {
    this.transactionService.performReset();
  }

  
  /**
   * Format number according to Indian currency
   * @param number
   * @returns
   */
  public toINR(number: number) {
    return this.utilityService.toINR(number);
  }
}

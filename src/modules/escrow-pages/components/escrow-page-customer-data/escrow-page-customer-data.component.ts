import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '@common/services';
import { AccountsAdminService } from '@modules/accounts/services';
import { escrowPageTransactionStatus } from '@modules/escrow-pages/data/escrow-page-transaction-status.constant';
import { EscrowPage } from '@modules/escrow-pages/models';
import {
  EscrowPagesCustomerService,
  EscrowPagesService
} from '@modules/escrow-pages/services';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import TransactionStatus from '../../constants/transactionStatuses';
@Component({
  selector: 'sbpro-escrow-page-customer-data',
  templateUrl: './escrow-page-customer-data.component.pug',
  styleUrls: ['./escrow-page-customer-data.component.scss']
})
export class EscrowPageCustomerDataComponent implements OnInit {
  @Input() pageSize = 8;
  @Input() isSuperAdmin = false;
  model!: NgbDateStruct;
  customerData$!: Observable<EscrowPage[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  private _loadingList$ = new BehaviorSubject(false);
  private pageId = '';
  filtersVisible = false;
  tableHeaders: string[] = [
    'OrderId',
    'Customer Name',
    'Email Address',
    'Email',
    'Amount',
    'Escrow',
    'Status'
  ];
  selectedToolTipData: EscrowPage[] | undefined;

  constructor(
    private _location: Location,
    public accountsService: AccountsAdminService,
    public changeDetectorRef: ChangeDetectorRef,
    private escrowPageService: EscrowPagesCustomerService,
    private escrowPageListService: EscrowPagesService,
    private toastService: ToastService,
    private calendar: NgbCalendar,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.paramMap.subscribe(resp => {
      try {
        this.pageId = resp.get('escrowPageId') || '';
      } catch (e) {
        console.error(e);
      }
    });
  }

  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  toggleFilters() {
    this.filtersVisible = !this.filtersVisible;
  }

  ngOnInit() {
    this.escrowPageService.isSuperAdmin = this.isSuperAdmin;
    this.escrowPageListService.isSuperAdmin = this.isSuperAdmin;
    this.escrowPageListService
      .getEscrowPage(this.pageId)
      .subscribe((resp: any) => {
        this.tableHeaders = resp.result.tableHeaders;
        console.log('table headers', this.tableHeaders);
      });
    this.loadData();
    this.escrowPageService.pageId = this.pageId;
    this.escrowPageService.pageSize = this.pageSize;
    this.customerData$ = this.escrowPageService.customers$;
    this.total$ = this.escrowPageService.total$;

    this.escrowPageService.customers$.subscribe(() => {
      this._loadingList$.next(false);
    });
  }

  refreshData() {
    this._loadingList$.next(true);
    this.escrowPageService
      .getSettlements(this.pageId)
      .subscribe((resp: any) => {
        console.log(resp);
      });
    console.log('Loading data');
    this.escrowPageService.performRefresh(this.pageId);
  }

  loadData() {
    this._loadingList$.next(true);
    console.log('Loading data');
    this.escrowPageService.performSearch(this.pageId);
  }

  submitSearchForm() {
    console.log('Submitting Search Form');
    // Reload the data
    this.escrowPageService.performSearch(this.pageId);
  }

  clearSearchForm() {
    this.escrowPageService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.escrowPageService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );

    this.escrowPageService.pageSize = 10;
    this.escrowPageService.searchTerm = '';
    // this.transactionService.accountId = '';
    // this.transactionService.transactionId = '';
    this.loadData();
  }

  goBack() {
    this._location.back();
  }

  // downloadData() {
  //   // this.escrowPageService.downloadData(this.pageId);
  // }

  viewAccountDetails(accountId: string) {
    if (this.isSuperAdmin) {
      this.router.navigate([
        environment.urlAdminPrefix + '/escrow/' + accountId
      ]);
    } else {
      this.router.navigate([
        environment.urlPortalPrefix + '/escrow/' + accountId
      ]);
    }
  }

  viewTransactionDetails(transactionId: string) {
    if (this.isSuperAdmin) {
      this.router.navigate([
        environment.urlAdminPrefix + '/transaction/' + transactionId
      ]);
    } else {
      this.router.navigate([
        environment.urlPortalPrefix + '/transaction/' + transactionId
      ]);
    }
  }

  getStatus(entry: any) {
    if (entry.status.status === TransactionStatus.SENTOBANK) {
      return TransactionStatus.PENDING;
    } else if (
      entry.status.status === TransactionStatus.SUCCESS &&
      !entry.settled &&
      !entry.payout
    ) {
      return TransactionStatus.SUCCESS;
    } else if (
      entry.status.status === TransactionStatus.SUCCESS &&
      entry.settled &&
      !entry.payout
    ) {
      return TransactionStatus.SETTLED;
    } else if (
      entry.status.status === TransactionStatus.SUCCESS &&
      entry.settled &&
      entry.payout
    ) {
      return TransactionStatus.COMPLETED;
    } else if (
      entry.status.status !== TransactionStatus.SENTOBANK &&
      entry.status.status !== TransactionStatus.SUCCESS
    ) {
      return entry.status.status;
    }
    return null;
  }

  getStatusDescription(status: string) {
    if (status === escrowPageTransactionStatus.SUCCESSFUL) {
      return 'SUCCESS - Payment completed by customer';
    } else if (status === escrowPageTransactionStatus.SETTLED) {
      return 'SETTLED - Payment settled in PG';
    } else if (status === escrowPageTransactionStatus.FAILED) {
      return 'Failed - Payment cancelled or failed';
    } else if (status === escrowPageTransactionStatus.SENT_TO_PG) {
      return 'PENDING - Payment pending';
    } else if (status === escrowPageTransactionStatus.INITIATED) {
      return 'INITIATED - Payment pending';
    } else {
      return status.toUpperCase();
    }
  }
}

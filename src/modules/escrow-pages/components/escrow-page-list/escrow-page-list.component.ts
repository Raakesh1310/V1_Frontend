import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import { AccountsAdminService } from '@modules/accounts/services';
import { EscrowPage } from '@modules/escrow-pages/models';
import { EscrowPagesService } from '@modules/escrow-pages/services';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'sbpro-escrow-page-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escrow-page-list.component.pug',
  styleUrls: ['./escrow-page-list.component.scss']
})
export class EscrowPageListComponent implements OnInit {
  @Input() pageSize = 8;
  @Input() isSuperAdmin = false;
  model!: NgbDateStruct;
  ePages$!: Observable<EscrowPage[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  private _loadingList$ = new BehaviorSubject(false);
  selectedToolTipData!: EscrowPage;
  filtersVisible = true;

  constructor(
    public accountsService: AccountsAdminService,
    public changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private escrowPageService: EscrowPagesService,
    private toastService: ToastService,
    private calendar: NgbCalendar
  ) {}

  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  toggleFilters() {
    this.filtersVisible = !this.filtersVisible;
  }

  ngOnInit() {
    this.escrowPageService.isSuperAdmin = this.isSuperAdmin;
    this.ePages$ = this.escrowPageService.escrowPages$;
    this.total$ = this.escrowPageService.total$;
    this.escrowPageService.escrowPages$.subscribe(() => {
      this._loadingList$.next(false);
    });

    this.escrowPageService.dateFrom = new NgbDate(
      0,0,0
    );
    this.escrowPageService.dateTo = new NgbDate(
      0,0,0
    );

    this.loadData();
  }

  refreshData() {
    this._loadingList$.next(true);
    console.log('Loading data');
    this.escrowPageService.performRefresh();
  }

  loadData() {
    this._loadingList$.next(true);
    console.log('Loading data');
    this.escrowPageService.performSearch();
  }

  submitSearchForm() {
    console.log('Submitting Search Form');
    // Reload the data
    this.escrowPageService.performSearch();
  }

  clearSearchForm() {
    // tslint:disable-next-line:no-any
    (this.escrowPageService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    )),
      // tslint:disable-next-line:no-any
      (this.escrowPageService.dateTo = this.calendar.getNext(
        new NgbDate(0, 0, 0),
        'd',
        0
      )),
      (this.escrowPageService.pageSize = 10);
    this.escrowPageService.searchTerm = '';
    // this.transactionService.accountId = '';
    // this.transactionService.transactionId = '';
    this.loadData();
  }

  doneCopy() {
    this.showToast('Success', 'Link copied successfully', {
      headerClasses: 'bg-success text-white'
    });
  }

  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 5000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }

  viewDetails(id: string) {
    console.log(id);
    if (this.isSuperAdmin) {
      this.router.navigate([
        environment.urlAdminPrefix + '/escrow-pages/' + id
      ]);
    } else {
      this.router.navigate([
        environment.urlPortalPrefix + '/escrow-page/' + id
      ]);
    }
  }
  openMerchantDetails(merchantId: string) {
    this.router.navigate([
      environment.urlAdminPrefix + '/merchant/' + merchantId
    ]);
  }
  viewAccountDetails(accountId: string) {
    if (this.isSuperAdmin) {
      this.router.navigate([
        environment.urlAdminPrefix + '/account/' + accountId
      ]);
    } else {
      this.router.navigate([
        environment.urlPortalPrefix + '/account/' + accountId
      ]);
    }
  }
}

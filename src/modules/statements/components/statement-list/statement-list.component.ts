import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DATE_DIFFERENTIAL_IN_MONTH } from '@common/constants/common.constant';
import { dateMonthDifference } from '@common/services/dateMonthDifference';
import { AuthService } from '@modules/auth/services';
import { StatementsService } from '@modules/statements/services';
import { Transaction } from '@modules/transactions/models';
import { Transfer } from '@modules/transfers/models';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'sbpro-statement-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './statement-list.component.pug',
  styleUrls: ['statement-list.component.scss']
})
export class StatementListComponent implements OnInit {
  @Input() public accountId = '';
  model!: NgbDateStruct;
  statements$!: Observable<(Transfer | Transaction)[]>;
  total$!: Observable<number>;
  private _loadingList$ = new BehaviorSubject(false);
  dropdownOpen: boolean = false;

  filtersVisible = true;
  isAdmin = false;

  constructor(
    public statementService: StatementsService,
    public changeDetectorRef: ChangeDetectorRef,
    private calendar: NgbCalendar,
    private router: Router,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
  }

  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  ngOnInit() {
    this.statementService.accountId = this.accountId;
    this.statements$ = this.statementService.statement$;
    this.total$ = this.statementService.total$;
    //this.isAdmin = this.authService.isSuperAdmin();
    const { dateFrom, dateTo } = dateMonthDifference(
      new Date(),
      DATE_DIFFERENTIAL_IN_MONTH
    );
    this.statementService.dateFrom = new NgbDate(
      dateFrom.year,
      dateFrom.month,
      dateFrom.day
    );
    this.statementService.dateTo = new NgbDate(
      dateTo.year,
      dateTo.month,
      dateTo.day
    );

    this.loadData();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  loadData() {
    this._loadingList$.next(true);
    this.statementService.retrieveData(this.isAdmin).subscribe(resp => {
      this._loadingList$.next(false);
    });
  }

  submitSearchForm() {
    this.statementService.page = 1;
    // this.loadData();
  }

  clearForm() {
    console.log('clearing form');
    this.statementService.page = 1;
    this.statementService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.statementService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.statementService.s = '';
    this.statementService.bank = '';
    this.loadData();
  }

  openAccount(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/escrow/' + id]);
  }
  openMerchant(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/merchant/' + id]);
  }
  openTransfer(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/transfer/' + id]);
  }
  openTransaction(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/transaction/' + id]);
  }

  highlight(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target.style.backgroundColor = '#f0f0f0';
  }

  unhighlight(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target.style.backgroundColor = '';
  }

  download(fileType: string){
    this.statementService.fileType = fileType;
    this.statementService.updateReportDownloadLink();
  }

}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_DIFFERENTIAL_IN_MONTH } from '@common/constants/common.constant';
import { UtilityService } from '@common/services';
import { dateMonthDifference } from '@common/services/dateMonthDifference';
import { AuthService } from '@modules/auth/services';
import { BankStatement } from '@modules/bank-account/models';
import { BankStatementsService } from '@modules/bank-account/services/bank-statements.service';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'sbpro-bank-account-statement',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bank-account-statement.component.pug',
  styleUrls: ['./bank-account-statement.component.scss']
})
export class BankAccountStatementComponent implements OnInit {
  @Input() public accountId = '';
  model!: NgbDateStruct;
  bankStatements$!: Observable<BankStatement[]>;
  total$!: Observable<number>;
  private _loadingList$ = new BehaviorSubject(false);
  private _accountId: string | null = '';

  filtersVisible = true;
  isAdmin = false;

  constructor(
    public bankStatementService: BankStatementsService,
    public changeDetectorRef: ChangeDetectorRef,
    private calendar: NgbCalendar,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private utilityService: UtilityService,
    private _location: Location,
  ) {
    this._accountId = activatedRoute.snapshot.paramMap.get('accountId');
    this.isAdmin = this.authService.isSuperAdmin();
  }

  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  ngOnInit() {
    this.bankStatementService.accountId = this._accountId;
    this.bankStatements$ = this.bankStatementService.statement$;
    this.total$ = this.bankStatementService.total$;
    const { dateFrom, dateTo } = dateMonthDifference(
      new Date(),
      DATE_DIFFERENTIAL_IN_MONTH
    );
    this.bankStatementService.dateFrom = new NgbDate(
      dateFrom.year,
      dateFrom.month,
      dateFrom.day
    );
    this.bankStatementService.dateTo = new NgbDate(
      dateTo.year,
      dateTo.month,
      dateTo.day
    );

    this.loadData();
  }

  loadData() {
    this._loadingList$.next(true);
    this.bankStatementService
      .retrieveBankStatements(this.isAdmin, this._accountId as string)
      .subscribe(resp => {
        this._loadingList$.next(false);
      });
    console.log(this.bankStatements$);
  }

  clearForm() {
    console.log('Clearing Form');
    this.bankStatementService.page = 1;
    this.bankStatementService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.bankStatementService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.bankStatementService.s = '';
    this.bankStatementService.bank = '';
    this.loadData();
  }

  public toINR(number: number) {
    let updated = this.utilityService.toINR(number);
    return updated;
  }

  public toUTC(date: Date) {
    let newTime = new Date(date.toString()).toUTCString();
    return newTime;
  }

  public submitSearch() {
    this.bankStatementService.page = 1;
  }

  goBack() {
    this._location.back();
  }
}

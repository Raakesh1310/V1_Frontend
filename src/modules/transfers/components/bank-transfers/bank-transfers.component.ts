import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DATE_DIFFERENTIAL_IN_WEEK } from '@common/constants/common.constant';
import { UtilityService } from '@common/services';
import { dateWeekDifference } from '@common/services/dateMonthDifference';
import { AuthService } from '@modules/auth/services';
import { SortEvent } from '@modules/transactions/directives';
import { Transfer } from '@modules/transfers/models';
import { TransfersAdminService } from '@modules/transfers/services/transferAdmin.service';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import merchantUserRoles from 'config/merchantUserRoles';
import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import transferStatus from '../../../../config/transferStatus';
import { environment } from '../../../../environments/environment';
import approvalType from '../../constants/approvalType';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
@Component({
  selector: 'sbpro-bank-transfers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bank-transfers.component.pug',
  styleUrls: ['bank-transfers.component.scss']
})
export class BankTransfersComponent implements OnInit {
  @Input() pageSize = 10;
  page = 1;
  searchTerm = '';
  status = '';
  bank = '';
  @Input() readOnly = false;
  model!: NgbDateStruct;
  transfers$!: Observable<Transfer[]>;
  total$!: Observable<number>;
  private _loadingList$ = new BehaviorSubject(false);
  sortedColumn!: string;
  sortedDirection!: string;
  isLoadingAuthorization = false;
  errors: string[] = [];
  message = '';
  resultStatus = false;
  oldMap: boolean = false;
  startDate!: NgbDateStruct;
  endDate!: NgbDateStruct;
  statusList: string[] = [
    transferStatus.SUCCESS,
    transferStatus.FAILED,
    transferStatus.PENDING,
    transferStatus.PROCESSING
  ];
  adminStatusList: string[] = [
    transferStatus.SUCCESS,
    transferStatus.FAILED,
    transferStatus.TRUSTEEAPPROVAL
  ];
  filtersVisible = true;
  private modalRef?: NgbModalRef;

  isTrustee = false;
  trusteeEmails = '';
  isMerchantAuthorizer = false;
  roles: string[] = [];
  isSuperAdminViewer = false;
  @Input() isAdmin = false;
  selectedStatus = '';
  constructor(
    public authService: AuthService,
    public transferService: TransfersAdminService,
    public changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private calendar: NgbCalendar,
    private modalService: NgbModal,
    private utilityService: UtilityService,
    private httpClient: HttpClient,
    private dateParser: NgbDateParserService
  ) {
    this.message = '';
    this.resultStatus = false;
  }

  enableEdit = false;
  enableEditIndex = null;
  selectedTransfer: any = null;
  authorizers = [];

  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  openMap(modal: HTMLTemplateElement) {
    console.log('SELECTED TRANSFER ', this.selectedTransfer);
    const url =
      environment.apiPrefix +
      `/transfer/${this.selectedTransfer.transferId}/authorization`;

    this.isLoadingAuthorization = true;

    this.changeDetectorRef.detectChanges();
    this.httpClient.get(url).subscribe(
      (resp: any) => {
        console.log('RESP ', resp);
        if (resp.success) {
          this.selectedTransfer.authorization = resp.result;
        }
        this.mapAuthorizations();
        this.isLoadingAuthorization = false;
        this.changeDetectorRef.detectChanges();
        this.modalRef = this.modalService.open(modal, {
          backdrop: 'static'
        });
      },
      err => {
        this.isLoadingAuthorization = false;
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
        } else {
          console.log(err.error.errors);
          this.errors.push(err.error.errors);
          this.errors = err.error.errors;
        }
        this.changeDetectorRef.detectChanges();
      }
    );

    // this.changeDetectorRef.detectChanges();
  }

  getStatement(accountId: string) {
    if (this.isAdmin) {
      this.router.navigate([
        environment.urlAdminPrefix + '/bank-account/' + accountId
      ]);
    } else {
      this.router.navigate([
        environment.urlPortalPrefix + '/bank-account/' + accountId
      ]);
    }
  }

  mapAuthorizations() {
    const authorizations = [];
    let arrangedAuthorizer: any = {};

    if (
      this.selectedTransfer.authorization[0]?.data?.level ||
      Object.keys(this.selectedTransfer.authorization).includes('1account') ||
      Object.keys(this.selectedTransfer.authorization).includes('2merchant') ||
      Object.keys(this.selectedTransfer.authorization).includes('3admin') ||
      Object.keys(this.selectedTransfer.authorization).includes('4trustee')
    ) {
      this.oldMap = false;
      arrangedAuthorizer = this.arrangeAuthorizations(
        this.selectedTransfer.authorization
      );
      this.authorizers = arrangedAuthorizer;
      if (typeof arrangedAuthorizer['4trustee'][1] !== 'undefined') {
        this.trusteeEmails = arrangedAuthorizer['4trustee'][1]['authorizers'].map((item: any) => item.email).join(', ');
      }
      this.selectedTransfer.authorization = arrangedAuthorizer;
    } else if (this.selectedTransfer.authorization.length > 0) {
      this.oldMap = true;
      for (const auth of this.selectedTransfer.authorization) {
        console.log(auth);
        if (auth.verified && !auth.data.approved) {
          authorizations.push(auth);
          break;
        }
        authorizations.push(auth);
      }
      console.log(authorizations);
      authorizations.sort(
        (a: any, b: any) => a.data.priority - b.data.priority
      );

      this.selectedTransfer.authorization = authorizations;
    } else {
      // Authorization length is zero than set authorizers to 0
      this.authorizers = [];
    }
    this.changeDetectorRef.detectChanges();
  }
  /**
   * Sort authorizers according to their level and
   * authorizer type
   * @param authorizations
   * @returns
   */
  arrangeAuthorizations(authorizations: any) {
    let approvals: any = {
      '1account': {},
      '2merchant': {},
      '3admin': {},
      '4trustee': {}
    };

    let isArranged = false;
    for (let key of Object.keys(approvals)) {
      if (Object.keys(authorizations).includes(key)) {
        if (Object.keys(authorizations[key]).length > 0) {
          isArranged = true;
          break;
        }
      }
    }

    if (isArranged) {
      return authorizations;
    }

    authorizations.sort((a: any, b: any) => a.data.priority - b.data.priority);

    for (let authorization of authorizations) {
      if (authorization.data.type === approvalType.accountAuthorizer) {
        if (!(`${authorization.data.level}` in approvals['1account'])) {
          approvals['1account'][authorization.data.level] = {
            authorizers: [authorization],
            minApprovalsNeeded: authorization.data.approvalsRequired,
            isApproved: false,
            type: approvalType.accountAuthorizer
          };
        } else {
          approvals['1account'][authorization.data.level]['authorizers'].push(
            authorization
          );
        }
      }

      if (authorization.data.type === approvalType.merchantAuthorizer) {
        if (!(`${authorization.data.level}` in approvals['2merchant'])) {
          approvals['2merchant'][authorization.data.level] = {
            authorizers: [authorization],
            minApprovalsNeeded: authorization.data.approvalsRequired,
            isApproved: false,
            type: approvalType.merchantAuthorizer
          };
        } else {
          approvals['2merchant'][authorization.data.level]['authorizers'].push(
            authorization
          );
        }
      }

      if (authorization.data.type === approvalType.adminAuthorizer) {
        if (!(`${authorization.data.level}` in approvals['3admin'])) {
          approvals['3admin'][authorization.data.level] = {
            authorizers: [authorization],
            minApprovalsNeeded: authorization.data.approvalsRequired,
            isApproved: false,
            type: approvalType.adminAuthorizer
          };
        } else {
          approvals['3admin'][authorization.data.level]['authorizers'].push(
            authorization
          );
        }
      }

      if (authorization.data.type === approvalType.trustee) {
        if (!(`${authorization.data.level}` in approvals['4trustee'])) {
          approvals['4trustee'][authorization.data.level] = {
            authorizers: [authorization],
            minApprovalsNeeded: authorization.data.approvalsRequired,
            isApproved: false,
            type: approvalType.trustee
          };
        } else {
          approvals['4trustee'][authorization.data.level]['authorizers'].push(
            authorization
          );
        }
      }
    }

    for (let approval_type in approvals) {
      for (let level in approvals[approval_type]) {
        // level.
        let totalApproved = 0;
        for (let auth of approvals[approval_type][level].authorizers) {
          totalApproved += auth.data.approved ? 1 : 0;
        }
        approvals[approval_type][level].isApproved =
          totalApproved >= approvals[approval_type][level].minApprovalsNeeded;

        approvals[approval_type][level].authorizers.sort((a: any, b: any) => {
          return new Date(a.verifiedAt) > new Date(b.verifiedAt) ? 1 : -1;
        });
      }
    }

    return approvals;
  }

  closeModal() {
    this.modalRef?.close();
  }

  toggleFilters() {
    this.filtersVisible = !this.filtersVisible;
  }

  // tslint:disable-next-line:no-any
  enableEditMethod(e: any, i: any) {
    this.enableEdit = true;
    this.enableEditIndex = i;
  }

  updateRow(data: Transfer) {
    this.message = '';
    this.resultStatus = false;

    if (
      (data.utr === null || data.utr === '') &&
      data.status.toLowerCase() === 'success'
    ) {
      this.message = 'UTR is required when status is Success.';
      this.resultStatus = false;
      this.changeDetectorRef.detectChanges();
    } else {
      this.transferService
        .updateStatus(data.transferId, data.status, data)
        .subscribe(
          resp => {
            if (resp.success) {
              this.message = resp.message;
              this.resultStatus = true;
            } else {
              this.message = resp.message;
              this.resultStatus = false;
              // this.alertUserCreated(false, resp.message);
            }
            this.changeDetectorRef.detectChanges();
          },
          error => {
            this.message = 'Some error occurred.';
            this.resultStatus = false;
            this.changeDetectorRef.detectChanges();
          }
        );
      this.enableEdit = !this.enableEdit;
      this.loadData();
    }
  }

  ngOnInit() {
    // this.accountsService.retrieveData();
    // this.accountsService.performSearch();
    this.pageSize = this.pageSize;
    this.transfers$ = this.transferService.transfers$;
    this.total$ = this.transferService.total$;
    this.searchTerm = '';
    this.transferService.searchTerm = '';
    const { dateFrom, dateTo } = dateWeekDifference(
      new Date(),
      DATE_DIFFERENTIAL_IN_WEEK
    );
    this.transferService.dateFrom = new NgbDate(
      dateFrom.year,
      dateFrom.month,
      dateFrom.day
    );
    this.transferService.dateTo = new NgbDate(
      dateTo.year,
      dateTo.month,
      dateTo.day
    );

    this.loadData();
    this.checkForReadOnly();
  }

  async loadData() {
    this._loadingList$.next(true);
    this.transferService.retrieveBankTransfers(this.page).subscribe(resp => {
      this._loadingList$.next(false);
    });
  }

  pageChange(event: any) {
    console.log('PAGE ', this.page);
    console.log('PAGE EVENT ', event);
    const params: any = { page: this.page };
    this.enableEdit = false;
    this.enableEditIndex = null;
    if (this.startDate?.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this.startDate)
      ).toISOString();
    }
    if (this.endDate?.year > 2010) {
      //add one day to endDate
      const newDate = this.utilityService.getNextDayFromNgb(this.endDate);
      params.dateTo = new Date(this.dateParser.format(newDate)).toISOString();
    }
    if (this.searchTerm.length > 0) {
      params.s = this.searchTerm.trim();
    }

    if (this.bank !== '') {
      params.bank = this.bank;
    }

    if (this.selectedStatus !== '') {
      params.status = this.selectedStatus;
    }

    // this.loadData(params, this.connectedBanking);
    this.transferService.retrieveBankTransfers(this.page).subscribe(resp => {
      this._loadingList$.next(false);
    });
    this.changeDetectorRef.detectChanges();
  }

  checkForReadOnly() {
    this.roles = this.authService.getRole();
    this.isSuperAdminViewer =
      this.roles?.indexOf(merchantUserRoles.SUPER_ADMIN_VIEWER) > -1
        ? true
        : false;
    this.isTrustee =
      this.roles?.indexOf(merchantUserRoles.TRUSTEE) > -1 ? true : false;
    this.isMerchantAuthorizer =
      this.roles?.indexOf(merchantUserRoles.MERCHANT_AUTHORIZER) > -1
        ? true
        : false;
    if (
      this.roles &&
      (this.isTrustee || this.isSuperAdminViewer || this.isMerchantAuthorizer)
    ) {
      this.readOnly = true;
    }
  }

  setColor(status: string) {
    if (status === 'Success') {
      return '#18B81F';
    } else if (status === 'Pending for Authorization') {
      return '#F5A500';
    } else if (status === 'Sent for Processing') {
      return '#329ca8';
    } else if (status === 'Failed') {
      return '#FF0000';
    }
  }

  submitSearchForm() {
    this.page = 1;
    console.log('Submitting Search Form');
    // Reload the data
    this.transferService.retrieveBankTransfers(this.page).subscribe();
  }

  clearForm() {
    console.log('clearing form');
    // tslint:disable-next-line:no-any
    this.transferService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    // tslint:disable-next-line:no-any
    this.transferService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.pageSize = 10;
    this.searchTerm = '';
    this.transferService.searchTerm = '';
    this.transferService.status = '';
    this.transferService.bank = '';
    this.loadData();
    let dNow = new Date();
    this.transferService.dateFromMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.transferService.dateToMax = this.calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.changeDetectorRef.detectChanges();
  }

  onSort({ column, direction }: SortEvent) {
    this.sortedColumn = column;
    this.sortedDirection = direction;
    this.transferService.sortColumn = column;
    this.transferService.sortDirection = direction;
    this.changeDetectorRef.detectChanges();
  }

  updateStatus($event: string) {
    this.transferService.status = $event;
    console.log(this.transferService.status);
  }

  openDetails(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/escrow/' + id]);
  }

  openTransferDetails(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/transfer/' + id]);
  }
  openMerchantDetails(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/merchant/' + id]);
  }

  public toINR(number: number) {
    let updated = this.utilityService.toINR(number);
    return updated;
  }
}

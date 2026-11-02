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
import { Route, Router } from '@angular/router';
import { UtilityService } from '@common/services';
import { Account } from '@modules/accounts/models';
import { AccountsService } from '@modules/accounts/services';
import { SBSortableHeaderDirective } from '@modules/passbook/directives';
import { PassbookService } from '@modules/passbook/services';
import approvalType from '../../../transfers/constants/approvalType';
import { Transfer } from '@modules/transfers/models';
import {
  NgbCalendar,
  NgbDate,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import * as date from 'date-and-time';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TransfersService } from '@modules/transfers/services';
import transferStatus from 'config/transferStatus';
import { dateWeekDifference } from '@common/services/dateMonthDifference';
import { DATE_DIFFERENTIAL_IN_WEEK } from '@common/constants/common.constant';
import { HttpClient } from '@angular/common/http';
import _ from 'lodash';
import { AuthService } from '@modules/auth/services';

@Component({
  selector: 'sbpro-passbook-table-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './passbook-table-list.component.pug',
  styleUrls: ['passbook-table-list.component.scss']
})
export class PassbookTableListComponent implements OnInit, OnDestroy {
  @Input() pageSize = 10;
  oldMap: boolean = false;
  transfers$!: Observable<Transfer[]>;
  accounts$!: Observable<Account[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  clearForm = false;
  showDetail = false;
  // tslint:disable-next-line:no-any
  selectedTransfer: any = null;
  private modalRef?: NgbModalRef;
  authorizers = [];
  statusList: string[] = [
    transferStatus.SUCCESS,
    transferStatus.FAILED,
    transferStatus.PENDING,
    transferStatus.PROCESSING
  ];
  message = '';
  resultStatus = false;
  @Input() isTesting = false;
  enableEdit = false;
  enableEditIndex = 0;
  isLoadingAuthorization = false;
  errors: string[] = [];
  @Input() connectedBanking = false;
  trusteeEmails = '';

  @ViewChildren(SBSortableHeaderDirective) headers!: QueryList<
    SBSortableHeaderDirective
  >;

  constructor(
    public passbookService: PassbookService,
    // public accountService: AccountsService,
    public changeDetectorRef: ChangeDetectorRef,
    private calendar: NgbCalendar,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    public router: Router,
    private authService: AuthService,
    public transferService: TransfersService,
    private utilityService: UtilityService,
    private httpClient: HttpClient
  ) { }

  ngOnInit() {
    this.passbookService.page = 1;
    this.passbookService.searchTerm = '';
    this.passbookService.pageSize = this.pageSize;
    this.transfers$ = this.passbookService.transfers$;
    // this.accounts$ = this.accountService.account$;
    this.total$ = this.passbookService.total$;
    this.updateAccount('');

    const { dateFrom, dateTo } = dateWeekDifference(
      new Date(),
      DATE_DIFFERENTIAL_IN_WEEK
    );
    this.passbookService.dateFrom = new NgbDate(
      dateFrom.year,
      dateFrom.month,
      dateFrom.day
    );
    this.passbookService.dateTo = new NgbDate(
      dateTo.year,
      dateTo.month,
      dateTo.day
    );
    let merchantProfile = this.authService.getMerchantProfile();
    this.isTesting = merchantProfile?.enableTesting
      ? merchantProfile?.enableTesting
      : false;
    this.passbookService.connectedBanking = this.connectedBanking;
    this.passbookService.performSearch();
  }

  updateAccount($event: string) {
    console.log('update request received');
    this.passbookService.account = $event;
  }

  clearSearchForm() {
    this.clearForm = false;
    this.passbookService.searchTerm = '';
    this.updateAccount('');
    this.passbookService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.passbookService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.passbookService.status = '';
    this.passbookService.status = '';
    this.passbookService.performSearch();
  }

  submitSearchForm() {
    this.clearForm = true;
    console.log('Submitting Search Form');
    this.passbookService.page = 1;

    // Reload the data
    this.passbookService.performSearch();
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
    return date.format(d, 'DD MMM YYYY');
  }

  ngOnDestroy() {
    this.passbookService.performReset();
  }

  // tslint:disable-next-line:no-any
  selectTransfer(transfer: any) {
    this.showDetail = true;
    this.selectedTransfer = transfer;
    this.cdr.detectChanges();
  }

  showDetails(id: string) {
    this.router
      .navigate([environment.urlPortalPrefix + '/passbook/' + id])
      .then(r => r);
  }

  goBack() {
    this.showDetail = false;
    this.selectedTransfer = null;
    this.cdr.detectChanges();
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
      console.log(arrangedAuthorizer);
      console.log(this.selectedTransfer);
      this.authorizers = arrangedAuthorizer;
      this.selectedTransfer.authorization = arrangedAuthorizer;
      if (typeof arrangedAuthorizer['4trustee'][1] !== 'undefined') {
        this.trusteeEmails = arrangedAuthorizer['4trustee'][1]['authorizers'].map((item: any) => item.email).join(', ');
      }
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
  }

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
          approvals['1account'][authorization.data.level][
            'authorizers'
          ].unshift(authorization);
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
          approvals['2merchant'][authorization.data.level][
            'authorizers'
          ].unshift(authorization);
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
          approvals['3admin'][authorization.data.level]['authorizers'].unshift(
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
          approvals['4trustee'][authorization.data.level][
            'authorizers'
          ].unshift(authorization);
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

  //Edit Transfers: Only in Test Environments
  enableEditMethod(e: Event, i: number) {
    this.enableEdit = true;
    this.enableEditIndex = i;
  }

  //Edit Transfers
  updateRow(data: Transfer) {
    this.message = '';
    this.resultStatus = false;

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
          }
          this.cdr.detectChanges();
        },
        error => {
          console.log(error);
          this.message = 'An error occurred.';
          this.resultStatus = false;
          this.cdr.detectChanges();
        }
      );
    this.enableEdit = !this.enableEdit;
    this.passbookService.performSearch();
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

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  Input
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TransferBulkResponseModel } from '@modules/passbook/models/transfer-response.model';
import {
  ModalDismissReasons,
  NgbCalendar,
  NgbDate,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';
import { AuthService } from '@modules/auth/services';
import { ExcelAccountFormat } from '@modules/transfers/models/create-transfer-response.model';
import * as XLSX from 'xlsx';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { ActivatedRoute, Router } from '@angular/router';
import transferStatus from '../../../../config/transferStatus';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService, UtilityService } from '@common/services';
import approvalType from '@modules/transfers/constants/approvalType';
import _ from 'lodash';
import { dateMonthDifference } from '@common/services/dateMonthDifference';
import { DATE_DIFFERENTIAL_IN_MONTH } from '@common/constants/common.constant';
import merchantUserRoles from 'config/merchantUserRoles';

@Component({
  selector: 'sbpro-bulk-table-list',
  templateUrl: './bulk-table-list.component.pug',
  styleUrls: ['./bulk-table-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BulkTableListComponent implements OnInit {
  @Input() readOnly = false;
  total$!: number;
  isLoading = false;
  isLoadingAuthorization = false;
  completedStatus = transferStatus.COMPLETED;
  page = 1;
  pageSize = 10;
  transferTotal$!: number;
  transferPage = 1;
  transferPageSize = 10;
  noOfPayees = 0;
  data: Array<TransferBulkResponseModel> = [];
  startDate!: NgbDateStruct;
  endDate!: NgbDateStruct;
  startTimeStamp = 0;
  errors: string[] = [];
  endTimeStamp = 0;
  maxDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getUTCDate()
  };
  isAdmin = false;
  payeeOfSingleTransfer: ExcelAccountFormat[] = [];
  searchTerm = '';
  selectedTransfer: any = null;
  enableEdit = false;
  enableEditIndex = null;
  statusListSearch: string[] = [
    transferStatus.COMPLETED,
    transferStatus.SUCCESS,
    transferStatus.FAILED,
    transferStatus.PENDING,
    transferStatus.PROCESSING
  ];

  bank: '';
  statusList: string[] = [transferStatus.PROCESSING];
  adminStatusList: string[] = [transferStatus.TRUSTEEAPPROVAL];
  excelHeaders: ExcelAccountFormat[] = [
    // {
    //   beneficiaryBankName : 'Beneficiary Name',
    //   beneficiaryAccNumber : 'Beneficiary Account number',
    //   beneficiaryIFSC : 'IFSC code',
    //   // @ts-ignore
    //   amount : 'Amount',
    //   purpose : 'Description / Purpose',
    //   beneficiaryName : 'Bank Name',
    // }
  ];
  selectedStatus = '';
  selectedStatusRow = '';
  private modalRef?: NgbModalRef;
  downloadLink = '';
  oldMap: boolean = false;
  authorizers: Record<string, Record<string, { authorizers: any[] }>> = {'1account': {},'2merchant': {},'3admin': {},'4trustee': {}};
  @Input() isTesting = false;
  isTrustee = false;
  roles: string[] = [];
  isSuperAdminViewer = false;
  @Input() connectedBanking = false;
  trusteeEmails = '';
  //date!: {year: number, month: number, day: number};

  constructor(
    private httpClient: HttpClient,
    private cdr: ChangeDetectorRef,
    private calendar: NgbCalendar,
    private modalService: NgbModal,
    private authService: AuthService,
    private dateParser: NgbDateParserService,
    private router: Router,
    private route: ActivatedRoute,
    private utilityService: UtilityService
  ) {
    // this.today = this.calendar.getNext(new NgbDate(0, 0, 0), 'd', 0);
    console.log('DATE ', new Date());
    this.isAdmin = this.authService.isSuperAdmin();
    let merchantProfile = this.authService.getMerchantProfile();

    if (!this.isAdmin && !environment.production && merchantProfile?.enableTesting) {
      this.adminStatusList = [transferStatus.SUCCESS, transferStatus.FAILED];
      this.statusList = this.adminStatusList;
      this.isTesting = true;
    }
    this.bank = '';
    // if (localStorage.getItem('PageNumberOfbulkTransfer')) {
    //   // @ts-ignore
    //   this.page = +localStorage.getItem('PageNumberOfbulkTransfer');
    //   localStorage.removeItem('PageNumberOfbulkTransfer');
    // }
  }

  ngOnInit(): void {
    this.searchTerm = '';
    this.bank = '';
    console.log('cwnwncowecnoewc', this.page);
    const { dateFrom, dateTo } = dateMonthDifference(
      new Date(),
      DATE_DIFFERENTIAL_IN_MONTH
    );
    this.startDate = new NgbDate(dateFrom.year, dateFrom.month, dateFrom.day);
    this.endDate = new NgbDate(dateTo.year, dateTo.month, dateTo.day);

    this.getBulkTransfers(this.prepareParams(), this.connectedBanking);
    this.updateDownloadLink();
    this.checkForReadOnly();
  }

  clearSearch() {
    this.startDate = { year: 0, day: 0, month: 0 };
    this.endDate = { year: 0, day: 0, month: 0 };
    this.searchTerm = '';
    this.bank = '';
    this.selectedStatus = '';
    this.getBulkTransfers(this.prepareParams(), this.connectedBanking);
    this.updateDownloadLink();
  }

  checkForReadOnly() {
    this.roles = this.authService.getRole();
    this.isSuperAdminViewer =
      this.roles?.indexOf(merchantUserRoles.SUPER_ADMIN_VIEWER) > -1
        ? true
        : false;
    this.isTrustee =
      this.roles?.indexOf(merchantUserRoles.TRUSTEE) > -1 ? true : false;
    if (this.roles && (this.isTrustee || this.isSuperAdminViewer)) {
      this.readOnly = true;
    }
  }

  getBulkTransfers(params: any, connectedBanking: boolean = false) {
    console.log('GETTING BULK TRANSFERS');
    this.errors = [];
    this.data = [];
    this.isLoading = true;
    this.cdr.detectChanges();
    let url = environment.apiPrefix + '/multi-transfer';
    if (this.isAdmin) {
      url = environment.apiPrefix + '/super-admin/multi-transfer';
    }

    if (connectedBanking) {
      url += '/bank-account-transfers';
    }
    this.httpClient.get(url, { params }).subscribe(
      (resp: any) => {
        console.log('RESP ', resp);
        this.data = [];
        if (resp.success) {
          this.updateDownloadLink();
          this.noOfPayees = resp.itemsCount;
          this.data = resp.result;
          this.total$ = resp.allItemsCount;
          console.log('DATA ', this.data);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      err => {
        this.isLoading = false;
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
        } else {
          console.log(err.error.errors);
          this.errors.push(err.error.errors);
          //this.errors = err.error.errors;
        }
        this.cdr.detectChanges();
      }
    );
  }

  setColor(status: string) {
    if (status === 'Success') {
      return '#18B81F';
    } else if (status === 'Completed') {
      return '#6C3483';
    } else if (status === 'Pending for Authorization') {
      return '#F5A500';
    } else if (status === 'Sent for Processing') {
      return '#329ca8';
    } else if (status === 'Failed') {
      return '#FF0000';
    }
  }

  startDateChange() {
    //console.log("EVENT ",event);
    console.log('DATE Start ', this.startDate);
    let date = new Date(
      this.startDate.year,
      this.startDate.month - 1,
      this.startDate.day,
      new Date().getHours(),
      new Date().getMinutes(),
      new Date().getSeconds()
    );
    this.startTimeStamp = date.getTime();
    console.log('TIMESTAMP 1 ', date.getTime());
  }

  endDateChange() {
    //console.log("EVENT ",event);
    console.log('DATE End ', this.endDate);
    let date = new Date(
      this.endDate.year,
      this.endDate.month - 1,
      this.endDate.day,
      new Date().getHours(),
      new Date().getMinutes(),
      new Date().getSeconds()
    );
    this.endTimeStamp = date.getTime();
    console.log('TIMESTAMP 2 ', date.getTime());
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

    this.getBulkTransfers(params, this.connectedBanking);
    this.updateDownloadLink();
    //this.cdr.detectChanges();
  }

  filterData() {
    this.errors = [];
    console.log('FILTERING DATA ');
    this.getBulkTransfers(this.prepareParams(), this.connectedBanking);
  }

  prepareParams(): any {
    const params: any = {};
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
    this.page = 1;
    if (this.startTimeStamp > this.endTimeStamp) {
      this.errors.push('Start Date should be less then End Date');
      return;
    }
    console.log('PARAMS ', params);
    return params;
  }

  downloadExcel(batchId: string) {
    console.log('DOWNLOADING EXCEL ');
    // no need to map headers as it will be map automatically
    this.excelHeaders = [];
    this.isLoading = true;
    this.cdr.detectChanges();
    let url = environment.apiPrefix + `/multi-transfer/${batchId}/transfers`;

    this.httpClient.get(url).subscribe(
      (resp: any) => {
        this.isLoading = false;
        this.payeeOfSingleTransfer = [];
        if (resp.success) {
          //this.noOfPayees = resp.itemsCount;
          if (resp.result.length > 0) {
            this.transferTotal$ = resp.result.length;
            this.payeeOfSingleTransfer = resp.result;
            this.payeeOfSingleTransfer.forEach(it => {
              // @ts-ignore
              this.excelHeaders.push({
                beneficiaryName: it.beneficiaryName,
                purpose: it.purpose,
                amount: it.amount,
                beneficiaryIFSC: it.beneficiaryIFSC,
                beneficiaryAccNumber: it.beneficiaryAccNumber,
                beneficiaryBankName: it.beneficiaryBankName,
              });
            });
            const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
              this.excelHeaders
            );

            /* generate workbook and add the worksheet */
            const wb: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Bulk Transfer Format');

            /* save to file */
            XLSX.writeFile(wb, `${batchId}.xlsx`, {
              bookType: 'xlsx',
              type: 'array'
            });
          }
        } else {
          console.log('ERROR ', resp.errors);
        }
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
        } else {
          console.log(err.error.errors);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    );
  }

  openMap(modal: HTMLTemplateElement, bulkTransfer: TransferBulkResponseModel) {
    console.log('GETTING BULK TRANSFERS Authorizations');
    console.log('SELECTED TRANSFER ', this.selectedTransfer);
    this.selectedTransfer = bulkTransfer;
    const url =
      environment.apiPrefix +
      `/multi-transfer/${this.selectedTransfer.batchId}/authorization`;

    this.isLoadingAuthorization = true;
    this.cdr.detectChanges();
    this.httpClient.get(url).subscribe(
      (resp: any) => {
        console.log('RESP ', resp);
        if (resp.success) {
          this.selectedTransfer.authorization = resp.result;
          console.log('DATA ', this.data);
        }
        this.mapAuthorizations();
        this.isLoadingAuthorization = false;
        this.cdr.detectChanges();
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
          //this.errors = err.error.errors;
        }
        this.cdr.detectChanges();
      }
    );
  }
  mapAuthorizations() {
    let arrangedAuthorizer: any = {};
    const authorizations = [];
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
      this.authorizers = {};
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

  open(
    content: any,
    batch_Id: string,
    pageSize: number,
    page: number,
    total: number
  ) {
    localStorage.setItem('PageNumberOfbulkTransfer', page.toString());
    if (this.isAdmin) {
      this.router
        .navigate(
          [environment.urlAdminPrefix + `/transfer/bulk-transfer/` + batch_Id],
          {
            queryParams: { page: this.page },
          }
        )
        .then(r => r);
    } else {
      this.router
        .navigate(
          [environment.urlPortalPrefix + `/transfer/bulk-transfer/` + batch_Id],
          {
            queryParams: { page: this.page }
          }
        )
        .then(r => r);
    }

    // this.payeeOfSingleTransfer = transferList;
    // this.transfersTotal$ = transferList.length;
    // this.transferPage = 1;
    // this.transferPageSize = 10;
    // this.cdr.detectChanges();
    // this.modalService.open(content, {
    //   ariaLabelledBy: 'modal-basic-title', backdrop: 'static',
    //   size: 'lg'
    // }).result.then((result) => {
    //   console.log(`Closed with: ${result}`);
    //   // this.total$ = total;
    //   // this.pageSize = pageSize;
    //   // this.page = Number(localStorage.getItem('PageNumberOfbulkTransfer'));
    //   // console.log("THIS PAGE ",this.page);
    //   // this.getBulkTransfers();
    //   this.cdr.detectChanges();
    // }, (reason) => {
    //   console.log(`Dismissed ${this.getDismissReason(reason)}`);
    //   // this.total$ = total;
    //   // this.pageSize = pageSize;
    //   // this.page = Number(localStorage.getItem('PageNumberOfbulkTransfer'));
    //   // console.log("THIS PAGE ",this.page);
    //   // this.getBulkTransfers();
    //   this.cdr.detectChanges();
    // });
  }

  getDismissReason(reason: ModalDismissReasons): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  Search(value: any) {
    console.log('VALUE ', value.target.value);
  }

  // tslint:disable-next-line:no-any
  enableEditMethod(e: any, i: any) {
    this.enableEdit = true;
    this.enableEditIndex = i;
  }

  updateRow(data: TransferBulkResponseModel) {
    // this.isLoading = true;
    // this.cdr.detectChanges();
    this.errors = [];
    if (this.selectedStatusRow === '') {
      this.errors.push('Select Valid Status');
      this.enableEdit = false;
      this.enableEditIndex = null;
      this.cdr.detectChanges();
      return;
    }
    console.log('UPDATE ROW CALLED ', data);
    let params: any = {};
    params.status = this.selectedStatusRow;
    console.log('PARAMS ', params);
    let url =
      environment.apiPrefix +
      (this.isAdmin
        ? `/super-admin/multi-transfer/${data.batchId}/status`
        : `/multi-transfer/${data.batchId}/status-test`);
    this.httpClient.put(url, params).subscribe(
      (resp: any) => {
        console.log('RESPONSE FROM STATUS API ', resp);
        if (resp.success) {
          // data.status = resp.result.status;
          // this.isLoading = false;
        } else {
          this.errors.push(
            'Cannot Change Status, as same status is being selected'
          );
        }
        this.selectedStatusRow = '';
        this.enableEdit = false;
        this.enableEditIndex = null;
        this.ngOnInit();
        this.cdr.detectChanges();
      },
      err => {
        // this._loading$.next(false);
        // this.submitted = false;
        //this.isLoading = false;
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          ////this.errors = ['Connection Error'];
        } else {
          console.log(err.error.errors);
          //this.errors = err.error.errors;
        }
        //this.cdr.detectChanges();
        // this.spinner.hide();
      }
    );
    this.enableEdit = !this.enableEdit;
    this.getBulkTransfers({ page: this.page }, this.connectedBanking);
  }

  dropdownChange(event: any, data: TransferBulkResponseModel) {
    console.log(data);
    console.log('DROP DOWN EVENT ', event.target.value.split(':')[1]);
    this.selectedStatusRow = event.target.value.split(':')[1].trim();
    // console.log(this.selectedStatusRow);
    // localStorage.setItem("Bulk_Transfer_Dorpdown_Status",event.target.value.split(':')[1]);
  }

  cancelClick(data: TransferBulkResponseModel) {
    this.enableEdit = false;
    this.enableEditIndex = null;
    this.selectedStatusRow = '';
    //this.ngOnInit();
    // if(localStorage.getItem("Bulk_Transfer_Dorpdown_Status")){
    //   // @ts-ignore
    //   data.status = localStorage.getItem("Bulk_Transfer_Dorpdown_Status").trim();
    // }
    // console.log("CANCEL CLICK ",data);
    // this.enableEdit = false;
    // this.cdr.detectChanges();
  }

  updateDownloadLink() {
    const params: any = {
      token: this.authService.getBearerToken()
    };
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
    if (this.selectedStatus !== '') {
      params.status = this.selectedStatus;
    }

    if (this.bank !== '') {
      params.bank = this.bank;
    }

    // this.page = 1;
    params.page = -1;
    // if (this.startTimeStamp > this.endTimeStamp) {
    //   this.errors.push('Start Date should be less then End Date');
    //   return;
    // }
    console.log('PARAMS ', params);
    let paramsSerialized = '';

    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }
    if (this.isAdmin) {
      this.downloadLink =
        environment.apiPrefix +
        '/super-admin/multi-transfer/report/download?' +
        paramsSerialized;
    } else {
      this.downloadLink =
        environment.apiPrefix +
        '/multi-transfer/report/download?' +
        paramsSerialized;
    }
    this.cdr.detectChanges();
  }

  /**
   * Format number according to Indian currency
   * @param number
   * @returns
   */
  public toINR(number: number) {
    let updatedNumber = this.utilityService.toINR(number);
    return updatedNumber;
  }

  hasRejectedAuthorizer(authKey: string, levelKey: string): boolean {
    if (!this.authorizers[authKey] || !this.authorizers[authKey]?.[levelKey]) {
      return false;
    }
    return this.authorizers[authKey][levelKey]['authorizers'].some(
      (authorizer: any) => authorizer.verified && !authorizer.data.approved
    );
  }
}

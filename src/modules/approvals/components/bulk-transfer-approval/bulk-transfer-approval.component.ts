import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';
import { bulkTransferApprovalModel } from '@modules/approvals/models';
import { environment } from '../../../../environments/environment';
import { ApprovalsService } from '@modules/approvals/services';
import { AuthService } from '@modules/auth/services';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';

@Component({
  selector: 'sbpro-bulk-transfer-approval',
  templateUrl: './bulk-transfer-approval.component.pug',
  styleUrls: ['./bulk-transfer-approval.component.scss']
})
export class BulkTransferApprovalComponent implements OnInit {
  startDate!: NgbDateStruct;
  endDate!: NgbDateStruct;
  errors: string[] = [];
  selectedForOperation = 0;
  maxDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getUTCDate()
  };
  searchTerm = '';
  selectedStatus = '';
  approvalList: string[] = [];
  data: Array<bulkTransferApprovalModel> = [];
  isLoading = false;
  isChecked = false;
  total$!: number;
  disableStatusButton = false;
  page = 1;
  pageSize = 10;
  startTimeStamp = 0;
  endTimeStamp = 0;
  isAdmin = false;
  rejectionReason = '';
  verificationIdMap = new Map();
  private modalRef?: NgbModalRef;

  constructor(
    public approvalService: ApprovalsService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private modalService: NgbModal,
    private router: Router,
    private dateParser: NgbDateParserService
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit(): void {
    localStorage.removeItem('verificationIdBulkMap');
    const params: any = { page: this.page };
    this.isChecked = false;
    this.selectedForOperation = 0;
    this.getBulkApprovals(params);
    //this.selectedForOperation = this.verificationIdMap.size;
    this.approvalList = [
      `Approve (${this.selectedForOperation})`,
      'Approve All',
      `Reject (${this.selectedForOperation})`,
      'Reject All'
    ];
  }

  getBulkApprovals(params: any) {
    this.data = [];
    this.verificationIdMap = new Map();
    if (localStorage.getItem('verificationIdBulkMap')) {
      this.verificationIdMap = new Map(
        JSON.parse(localStorage['verificationIdBulkMap'])
      );
      console.log(
        'VERIFICATION MAP VALUE ON BULK API ',
        this.verificationIdMap
      );
    }
    this.errors = [];
    this.isLoading = true;
    let url = this.adminCheck();
    this.approvalService.getBulkApprovalData(url, params).subscribe(
      (resp: any) => {
        console.log('APPROVALS ', resp);
        if (resp.success) {
          //resp.result.splice(1, 1); // has to be removed....
          resp.result.forEach((data: any) => {
            delete data.verified;
            //delete data.verificationId;
            delete data.updatedAt;
            delete data.merchantId;
            let obj: bulkTransferApprovalModel = {
              accountId: data.accountId || data.bankAccountNumber,
              batchId: data.batchId,
              createdAt: data.createdAt,
              isSelected: this.verificationIdMap.has(data.verificationId),
              paymentId: data.paymentId,
              totalAmount: data.totalAmount,
              //transferList: data.transferList,
              numberOfTransfers: data.numberOfTransfers,
              verificationId: data.verificationId,
              merchantName: data.merchantName,
              accName: data.accName || data.bankAccountName,
              bankAccountName: data.bankAccountName
            };
            this.data.push(obj);
          });
          // resp.result = resp.result.filter((data : any) => {
          //   delete data.verified;
          //   delete data.verificationId;
          //   delete data.updatedAt;
          //   delete data.merchantId;
          //   return true;
          // });
          console.log('DATA ', this.data);
          //this.data = resp.result;
          this.total$ = resp.allItemsCount;
          this.isLoading = false;
          this.cdr.detectChanges();
        } else {
          this.isLoading = false;
          this.errors.push(resp.errors);
          this.cdr.detectChanges();
          console.log('ERROR ', resp.errors);
        }
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
        }
        this.cdr.detectChanges();
      }
    );
  }

  adminCheck(): string {
    if (this.isAdmin) {
      return environment.apiPrefix + '/super-admin/multi-transfer/approvals';
    } else {
      return environment.apiPrefix + '/multi-transfer/approvals';
    }
  }

  sendBulkApprovals() {
    //console.log(this.selectedStatus+""+this.rejectionReason);
    this.errors = [];
    console.log(this.statusFiltering(this.selectedStatus));
    if (this.selectedStatus.includes('Reject') && this.rejectionReason === '') {
      return;
    }
    this.disableStatusButton = true;
    let verificationIds: string[] = [];
    for (let key of this.verificationIdMap.keys()) {
      console.log('Map Keys= ' + key);
      verificationIds.push(key.toString());
    }
    this.selectedStatus = this.statusFiltering(this.selectedStatus);
    let url = environment.apiPrefix + `/multi-transfer/approvals`;
    if (this.isAdmin) {
      url = environment.apiPrefix + `/super-admin/multi-transfer/approvals`;
    }
    let body: object = {
      action: this.selectedStatus,
      verificationIds: verificationIds,
      rejectMessage: this.rejectionReason
    };
    this.approvalService.bulkApprovalAction(url, body).subscribe(
      (resp: any) => {
        if (resp.success) {
          this.closeModal();
          this.page = 1;
          this.ngOnInit();
        } else {
          this.errors.push(resp.errors);
          console.log('ERROR ', resp.errors);
        }
        this.disableStatusButton = false;
        this.cdr.detectChanges();
      },
      err => {
        // this.isLoading = false;
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
        } else {
          console.log(err.error.errors);
          this.errors.push(err.error.errors);
        }
        this.closeModal();
        this.disableStatusButton = false;
        this.cdr.detectChanges();
      }
    );
  }

  statusFiltering(status: string): string {
    if (status === 'Approve All') {
      return 'approveAll';
    } else if (status.startsWith('Approve')) {
      return 'approve';
    } else if (status === 'Reject All') {
      return 'rejectAll';
    } else {
      return 'reject';
    }
  }

  rejectionReasonChange(event: any) {
    console.log('VALUE ', event.target.value);
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
    ); // month is 0 indexed so -1.....
    this.endTimeStamp = date.getTime();
    console.log('TIMESTAMP 2 ', date.getTime());
  }

  filterData() {
    this.isChecked = false;
    localStorage.setItem(
      'verificationIdBulkMap',
      JSON.stringify(Array.from(this.verificationIdMap.entries()))
    );
    console.log('FILTERING DATA ');
    const params: any = {};
    if (this.startDate?.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this.startDate)
      ).toISOString();
    }
    if (this.endDate?.year > 2010) {
      this.endDate.day = this.endDate.day + 1;

      params.dateTo = new Date(
        this.dateParser.format(this.endDate)
      ).toISOString();
    }
    if (this.searchTerm.length > 0) {
      params.s = this.searchTerm.trim();
    }
    // if (this.selectedStatus !== '') {
    //   params.status = this.selectedStatus;
    // }
    this.page = 1;
    console.log('PARAMS ', params);
    if (this.startTimeStamp > this.endTimeStamp) {
      this.errors.push('Start Date should be less then End Date');
      return;
    }
    this.getBulkApprovals(params);
  }

  Search(value: any) {
    console.log('VALUE ', value.target.value);
  }

  openModal(alertDialog: any, event: any) {
    console.log('Opening alert dialog');
    //this.dialog.open(alertDialog);
    console.log(event.target.value);
    if (this.data.length === 0) {
      this.errors.push('No Entries found.');
      return;
    }
    if (
      event.target.value === 'Approve (0)' ||
      event.target.value === 'Reject (0)'
    ) {
      this.errors.push('Please Select at least 1 Entry.');
      return;
    }
    if (event.target.value !== '') {
      this.selectedStatus = event.target.value
        .replace('(', '')
        .replace(')', '');
      this.modalRef = this.modalService.open(alertDialog, {
        backdrop: 'static',
        centered: true
      });
    }
  }

  closeModal() {
    this.modalRef?.close();
    this.rejectionReason = '';
    this.disableStatusButton = false;
    //this.ngOnInit();
  }

  alterMapValue(event: any, transfer: bulkTransferApprovalModel) {
    if (transfer) {
      if (event.currentTarget.checked) {
        if (this.verificationIdMap.size + 1 >= environment.maxApprovals) {
          event.preventDefault();
          this.errors.push(
            'Maximum Limit Reached, Please select less than ' +
              environment.maxApprovals.toString() +
              ' records'
          );
          this.cdr.detectChanges();
          return;
        } else {
          this.errors.length > 0 ? (this.errors = []) : '';
          this.cdr.detectChanges();
        }
        this.verificationIdMap.set(
          transfer.verificationId,
          event.currentTarget.checked
        );
      } else {
        if (this.verificationIdMap.has(transfer.verificationId)) {
          this.verificationIdMap.delete(transfer.verificationId);
        }
        this.errors.length > 0 &&
        this.verificationIdMap.size + 1 < environment.maxApprovals
          ? (this.errors = [])
          : '';
      }
    }
    this.cdr.detectChanges();
  }

  checkValue(event: any, transfer: bulkTransferApprovalModel) {
    console.log(transfer);
    this.alterMapValue(event, transfer);
    this.selectedForOperation = this.verificationIdMap.size;
    this.approvalList = [
      `Approve (${this.selectedForOperation})`,
      'Approve All',
      `Reject (${this.selectedForOperation})`,
      'Reject All'
    ];
    this.cdr.detectChanges();
  }

  selectAll(event: any) {
    console.log(event.currentTarget.checked);
    this.data.forEach(it => {
      it.isSelected = event.currentTarget.checked;
      this.alterMapValue(event, it);
    });
    console.log(this.data);
    //if (event.currentTarget.checked) {
    this.selectedForOperation = this.verificationIdMap.size;
    this.approvalList = [
      `Approve (${this.selectedForOperation})`,
      'Approve All',
      `Reject (${this.selectedForOperation})`,
      'Reject All'
    ];
    this.cdr.detectChanges();
  }

  pageChange(event: any) {
    console.log('PAGE ', this.page);
    console.log('PAGE EVENT ', event);
    localStorage.setItem(
      'verificationIdBulkMap',
      JSON.stringify(Array.from(this.verificationIdMap.entries()))
    );
    this.selectedForOperation = this.verificationIdMap.size; // to send approved count to next page...
    this.isChecked = false;
    const params: any = { page: this.page };
    this.getBulkApprovals(params);
    this.cdr.detectChanges();
  }

  open(batch_Id: string, pageSize: number, page: number) {
    //localStorage.setItem('PageNumberOfbulkTransfer', page.toString());
    if (this.isAdmin) {
      this.router
        .navigate([environment.urlAdminPrefix + `/approvals/` + batch_Id], {
          //queryParams: { page: this.page,approvals: true }
        })
        .then(r => r);
    } else {
      this.router
        .navigate([environment.urlPortalPrefix + `/approvals/` + batch_Id], {
          //queryParams: { page: this.page, approvals: true }
        })
        .then(r => r);
    }
  }

  setDataLocally() {
    localStorage.setItem(
      'verificationIdBulkMap',
      JSON.stringify(Array.from(this.verificationIdMap.entries()))
    );
  }

  clearButtonClick() {
    this.isChecked = false;
    this.searchTerm = '';
    // @ts-ignore
    this.startDate = null;
    // @ts-ignore
    this.endDate = null;
    localStorage.setItem(
      'verificationIdBulkMap',
      JSON.stringify(Array.from(this.verificationIdMap.entries()))
    );
    this.page = 1;
    this.getBulkApprovals({ page: 1 });
    this.cdr.detectChanges();
  }

  fetchDetails(transfer: bulkTransferApprovalModel){
    this.router.navigate([
      `${environment.urlPortalPrefix}/escrow/${transfer.accountId}`,
      {}
    ]);
  }
}

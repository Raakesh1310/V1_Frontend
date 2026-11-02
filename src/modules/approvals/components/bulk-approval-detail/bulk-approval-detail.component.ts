import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@modules/auth/services';
import { environment } from '../../../../environments/environment';
import { ApprovalsService } from '@modules/approvals/services';
import { singleBulkTransferApprovalModel } from '@modules/approvals/models';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';

@Component({
  selector: 'sbpro-bulk-approval-detail',
  templateUrl: './bulk-approval-detail.component.pug',
  styleUrls: ['./bulk-approval-detail.component.scss']
})
export class BulkApprovalDetailComponent implements OnInit {
  startDate!: NgbDateStruct;
  endDate!: NgbDateStruct;
  transferTotal$!: number;
  transferPage = 1;
  transferPageSize = 10;
  singleApprovalList: singleBulkTransferApprovalModel[] = [];
  maxDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getUTCDate()
  };
  searchTerm = '';
  selectedForOperation = 0;
  disableStatusButton = false;
  startTimeStamp = 0;
  endTimeStamp = 0;
  errors: string[] = [];
  isLoading = false;
  isChecked = false;
  isAdmin = false;
  queryPageNumber = 0;
  rejectionReason = '';
  comingFromApprovals = false;
  verificationIdMap = new Map();
  private modalRef?: NgbModalRef;

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    public approvalService: ApprovalsService,
    private modalService: NgbModal
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit(): void {
    localStorage.removeItem('verificationIdSingleBulkMap');
    console.log('Routing data ' + this.route.snapshot.params.id);
    this.isChecked = false;
    this.selectedForOperation = 0;
    // this.userId = this.route.snapshot.params.id; // accessing path params...
    this.getSingleBulkApproval({ s: this.route.snapshot.params.id });
    // accessing query params...
    // this.route.queryParams.subscribe((params: any) => {
    //   console.log('Params Data ', params);
    //   this.queryPageNumber = params.page;
    //   this.comingFromApprovals = params.approvals;
    // });
  }

  getSingleBulkApproval(params: any) {
    this.singleApprovalList = [];
    this.verificationIdMap = new Map();
    console.log('GETTING SINGLE BULK TRANSFERS');
    if (localStorage.getItem('verificationIdSingleBulkMap')) {
      this.verificationIdMap = new Map(
        JSON.parse(localStorage['verificationIdSingleBulkMap'])
      );
      console.log(
        'VERIFICATION MAP VALUE ON BULK SINGLE API ',
        this.verificationIdMap
      );
    }
    // this.data = [];
    this.isLoading = true;
    this.cdr.detectChanges();
    this.approvalService.getSingleBulkApproval(params.s).subscribe(
      (resp: any) => {
        if (resp.success) {
            this.transferTotal$ = resp.result.length;
            resp.result.forEach((data: any) => {
              let obj: singleBulkTransferApprovalModel = {
                accountId: data.accountId,
                amount: data.amount,
                beneficiaryName: data.beneficiaryName,
                createdAt: data.createdAt,
                isSelected: this.verificationIdMap.has(data.transferId),
                transferId: data.transferId,
                status: data.status
              };
              this.singleApprovalList.push(obj);
            });
            console.log('RESP ', resp);
        }
        // else {
        //   this.isLoading = false;
        //   console.log('ERROR ', resp.errors);
        //   // this.errors = resp.errors;
        //   // this.cdr.detectChanges();
        //   // this.spinner.hide();
        //   // this.alertPayeeCreated(false);
        // }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      err => {
        this.isLoading = false;
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          ////this.errors = ['Connection Error'];
        } else {
          console.log(err.error.errors);
          //this.errors = err.error.errors;
        }
        this.cdr.detectChanges();
        // this.spinner.hide();
      }
    );
  }

  sendSingleBulkApprovals() {
    this.errors = [];
    //console.log(this.statusFiltering(this.selectedStatus));
    if (this.rejectionReason === '') {
      return;
    }
    this.disableStatusButton = true;
    let verificationIds: Array<object> = [];
    for (let key of this.verificationIdMap.keys()) {
      console.log('Map Keys= ' + key);
      verificationIds.push({
        transferId: key,
        status: 'Failed'
      });
    }
    let url =
      environment.apiPrefix +
      `/multi-transfer/${this.route.snapshot.params.id}`;
    if (this.isAdmin) {
      url =
        environment.apiPrefix +
        `/super-admin/multi-transfer/${this.route.snapshot.params.id}`;
    }
    let body: object = {
      transferList: verificationIds
    };
    this.approvalService.singleBulkApprovalAction(url, body).subscribe(
      (resp: any) => {
        console.log('RESPONSE ', resp);
        if (resp.success) {
          this.closeModal();
          this.transferPage = 1;
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

  openModal(alertDialog: any) {
    console.log('Opening alert dialog');
    //this.dialog.open(alertDialog);
    console.log(event);
    if (this.selectedForOperation === 0) {
      this.errors.push('Please Select at least 1 Entry.');
      return;
    }
    //if (event.target.value !== '') {
    this.modalRef = this.modalService.open(alertDialog, {
      backdrop: 'static',
      centered: true
    });
    //}
  }

  closeModal() {
    this.modalRef?.close();
    this.rejectionReason = '';
    //this.ngOnInit();
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

  filterData() {
    this.isChecked = false;
    this.transferPage = 1;
    localStorage.setItem(
      'verificationIdSingleBulkMap',
      JSON.stringify(Array.from(this.verificationIdMap.entries()))
    );
    console.log('FILTERING DATA ');
    let stark: Array<singleBulkTransferApprovalModel> = [];
    this.errors = [];
    if (this.startTimeStamp > this.endTimeStamp) {
      this.errors.push('Start Date is greater then End Date');
      return;
    }
    // If start or end timeStamp is 0, then search according to search term...
    if (this.startTimeStamp === 0 || this.endTimeStamp === 0) {
      this.singleApprovalList.forEach(it => {
        let time = new Date(it.createdAt);
        console.log(time.getTime());
        if (
          it.transferId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          it.beneficiaryName
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        ) {
          stark.push(it);
        }
      });
    } else {
      this.singleApprovalList.forEach(it => {
        let time = new Date(it.createdAt);
        console.log(time.getTime());
        if (
          time.getTime() >= this.startTimeStamp &&
          time.getTime() <= this.endTimeStamp
        ) {
          if (this.searchTerm) {
            if (
              it.transferId
                .toLowerCase()
                .includes(this.searchTerm.toLowerCase()) ||
              it.beneficiaryName
                .toLowerCase()
                .includes(this.searchTerm.toLowerCase())
            ) {
              stark.push(it);
            }
          } else {
            stark.push(it);
          }
        }
      });
    }
    this.singleApprovalList = stark;
    this.cdr.detectChanges();
  }

  Search(value: any) {
    console.log('VALUE ', value.target.value);
  }

  alterMapValue(event: any, transfer: singleBulkTransferApprovalModel) {
    if (event.currentTarget.checked) {
      this.verificationIdMap.set(
        transfer.transferId,
        event.currentTarget.checked
      );
    } else {
      if (this.verificationIdMap.has(transfer.transferId)) {
        this.verificationIdMap.delete(transfer.transferId);
      }
    }
    this.cdr.detectChanges();
  }

  checkValue(event: any, transfer: singleBulkTransferApprovalModel) {
    console.log(transfer);
    this.alterMapValue(event, transfer);
    this.selectedForOperation = this.verificationIdMap.size;
    this.cdr.detectChanges();
  }

  selectAll(event: any) {
    console.log(event.currentTarget.checked);
    console.log(
      'DATA ',
      this.singleApprovalList.slice(
        (this.transferPage - 1) * this.transferPageSize,
        this.transferPage * this.transferPageSize
      )
    );
    this.singleApprovalList
      .slice(
        (this.transferPage - 1) * this.transferPageSize,
        this.transferPage * this.transferPageSize
      )
      .forEach(it => {
        if (it.status !== 'Failed') {
          it.isSelected = event.currentTarget.checked;
          this.alterMapValue(event, it);
        }
      }); // Select only 10 entries when select all is click...
    this.selectedForOperation = this.verificationIdMap.size;
    this.cdr.detectChanges();
  }

  loadPage(event: any) {
    console.log('PAGE ', this.transferPage);
    localStorage.setItem(
      'verificationIdSingleBulkMap',
      JSON.stringify(Array.from(this.verificationIdMap.entries()))
    );
    this.selectedForOperation = this.verificationIdMap.size; // to send approved count to next page...
    this.isChecked = false;
    this.cdr.detectChanges();
  }

  rejectionReasonChange(event: any) {
    console.log('VALUE ', event.target.value);
  }

  goBack() {
    localStorage.setItem('Index', '1');
    if (this.isAdmin) {
      this.router
        .navigate([environment.urlAdminPrefix + '/approvals'])
        .then(r => r);
    } else {
      this.router
        .navigate([environment.urlPortalPrefix + '/approvals'])
        .then(r => r);
    }
  }

  clearButtonClick() {
    this.isChecked = false;
    this.searchTerm = '';
    // @ts-ignore
    this.startDate = null;
    // @ts-ignore
    this.endDate = null;
    localStorage.setItem(
      'verificationIdSingleBulkMap',
      JSON.stringify(Array.from(this.verificationIdMap.entries()))
    );
    this.transferPage = 1;
    this.getSingleBulkApproval({ page: 1 });
    this.cdr.detectChanges();
  }
}

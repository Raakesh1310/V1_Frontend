import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';
import { ApprovalsService } from '@modules/approvals/services';
import { environment } from '../../../../environments/environment';
import { AuthService } from '@modules/auth/services';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { singleTransferApprovalModel } from '@modules/approvals/models';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { Router } from '@angular/router';

@Component({
  selector: 'sbpro-single-transfer-approval',
  templateUrl: './single-transfer-approval.component.pug',
  styleUrls: ['./single-transfer-approval.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleTransferApprovalComponent implements OnInit {
  @ViewChild('alert') alert!: HTMLTemplateElement;
  startDate!: NgbDateStruct;
  endDate!: NgbDateStruct;
  errors!: string[];
  selectedForOperation = 0;
  maxDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getUTCDate()
  };
  searchTerm = '';
  selectedStatus = '';
  approvalList: string[] = [];
  data: Array<singleTransferApprovalModel> = [];
  isLoading = false;
  isChecked = false;
  disableStatusButton = false;
  total$!: number;
  startTimeStamp = 0;
  endTimeStamp = 0;
  page = 1;
  pageSize = 10;
  isAdmin = false;
  apiUrl = '';
  rejectionReason = '';
  verificationIdMap = new Map();
  private modalRef?: NgbModalRef;

  constructor(
    public approvalService: ApprovalsService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private modalService: NgbModal,
    private dateParser: NgbDateParserService,
    private router: Router
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit(): void {
    this.errors = [];
    localStorage.removeItem('verificationIdMap');
    const params: any = { page: this.page };
    this.isChecked = false;
    this.selectedForOperation = 0;
    this.getSingleApprovals(params);
    //this.selectedForOperation = this.verificationIdMap.size;
    this.approvalList = [
      `Approve (${this.selectedForOperation})`,
      'Approve All',
      `Reject (${this.selectedForOperation})`,
      'Reject All'
    ];
    // this.enableEdit = false;
    // this.enableEditIndex = null;
  }

  getSingleApprovals(params: any) {
    this.data = [];
    this.verificationIdMap = new Map();
    if (localStorage.getItem('verificationIdMap')) {
      this.verificationIdMap = new Map(
        JSON.parse(localStorage['verificationIdMap'])
      );
      console.log('VERIFICATION MAP VALUE ON API ', this.verificationIdMap);
    }
    this.errors = [];
    this.isLoading = true;
    let url = this.adminCheck();
    this.approvalService.getSingleApprovalData(url, params).subscribe(
      (resp: any) => {
        console.log('APPROVALS ', resp);
        if (resp.success) {
          resp.result.forEach((data: any) => {
            delete data.verified;
            //delete data.verificationId;
            delete data.updatedAt;
            delete data.merchantId;
            let obj: singleTransferApprovalModel = {
              verificationId: data.verificationId,
              isSelected: this.verificationIdMap.has(data.verificationId),
              accountId: data.accountId || data.bankAccountNumber,
              amount: data.amount,
              beneficiaryName: data.beneficiaryName,
              createdAt: data.createdAt,
              purpose: data.purpose,
              transferId: data.transferId,
              beneficiaryAccNumber: data.beneficiaryAccNumber,
              beneficiaryIFSC: data.beneficiaryIFSC,
              createdBy: data.createdBy,
              remarks: data.remarks,
              status: data.status,
              merchantName: data.merchantName,
              accName: data.accName || data.bankAccountName,
              bankAccountName: data.bankAccountName
              
            };
            this.data.push(obj);
          });
          console.log('DATA ', this.data);
          // resp.result = resp.result.filter((data : any) => {
          //   delete data.verified;
          //   //delete data.verificationId;
          //   delete data.updatedAt;
          //   delete data.merchantId;
          //   return true;
          // });
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
      return environment.apiPrefix + '/super-admin/transfer/approvals';
    } else {
      return environment.apiPrefix + '/transfer/approvals';
    }
  }

  sendSingleApprovals() {
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
    let url = environment.apiPrefix + `/transfer/approvals`;
    if (this.isAdmin) {
      url = environment.apiPrefix + `/super-admin/transfer/approvals`;
    }
    let body: object = {
      action: this.selectedStatus,
      verificationIds: verificationIds,
      rejectMessage: this.rejectionReason
    };
    this.approvalService.approvalAction(url, body).subscribe(
      (resp: any) => {
        // switch (event.type) {
        //   case HttpEventType.Sent:
        //     console.log('Request has been made!');
        //     break;
        //   case HttpEventType.ResponseHeader:
        //     console.log('Response header has been received!');
        //     break;
        //   case HttpEventType.UploadProgress:
        //     // @ts-ignore
        //     let progress = Math.round((event.loaded / event.total) * 100);
        //     console.log(`Uploaded! ${progress}%`);
        //     break;
        //   case HttpEventType.Response:
        //     console.log('Approval successfully Done!', event.body);
        //     if (event.body.success) {
        //       this.closeModal();
        //       this.page = 1;
        //       this.ngOnInit();
        //     } else {
        //       this.errors.push(event.body.errors);
        //       console.log('ERROR ', event.body.errors);
        //     }
        //     this.disableStatusButton = false;
        //     this.cdr.detectChanges();
        //   // setTimeout(() => {
        //   //   this.progress = 0;
        //   // }, 1500);
        // }
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
    let returnedStatus = '';
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
    ); // month is 0 indexed so -1.....
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

  showDetails(obj: singleTransferApprovalModel) {
    if (this.isAdmin) {
      this.router
        .navigate([environment.urlAdminPrefix + '/transfer/' + obj.transferId])
        .then(r => r);
    } else {
      this.router
        .navigate([environment.urlPortalPrefix + '/passbook/' + obj.transferId])
        .then(r => r);
    }
  }

  filterData() {
    console.log('FILTERING DATA ');
    this.isChecked = false;
    this.setDataLocally();
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
    this.getSingleApprovals(params);
  }

  Search(value: any) {
    console.log('VALUE ', value.target.value);
  }

  rejectionReasonChange(event: any) {
    console.log('VALUE ', event.target.value);
  }

  openModal(alertDialog: any, event: any) {
    this.errors = [];
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
      this.errors.push('Please select at least one entry.');
      return;
    }
    if (event.target.value !== '') {
      // setting selected status value..
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

  // approvalChanged(event: any) {
  //   console.log(event);
  //   if (event !== '') {
  //     this.openModal(this.alert);
  //     this.cdr.detectChanges();
  //   }
  // }

  alterMapValue(event: any, transfer: singleTransferApprovalModel) {
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

  checkValue(event: any, transfer: singleTransferApprovalModel) {
    console.log(transfer);
    this.alterMapValue(event, transfer);
    // this.selectedForOperation = event.currentTarget.checked ? this.selectedForOperation + 1
    //   : this.selectedForOperation - 1;
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
    // } else {
    //   this.selectedForOperation = this.verificationIdMap.size;
    //   this.approvalList = [
    //     `Approve (${this.selectedForOperation})`,
    //     'Approve All',
    //     `Reject (${this.selectedForOperation})`,
    //     'Reject All'
    //   ];
    // }
    this.cdr.detectChanges();
  }

  pageChange(event: any) {
    console.log('PAGE ', this.page);
    console.log('PAGE EVENT ', event);
    console.log('VERIFICATION MAP ', this.verificationIdMap);
    // if(localStorage.getItem("verificationIdMap")){
    //   let map = new Map(JSON.parse(localStorage["verificationIdMap"]));
    //
    // }else{

    localStorage.setItem(
      'verificationIdMap',
      JSON.stringify(Array.from(this.verificationIdMap.entries()))
    );
    this.selectedForOperation = this.verificationIdMap.size; // to send approved count to next page...
    this.isChecked = false;
    //}
    const params: any = { page: this.page };
    this.getSingleApprovals(params);
    //this.ngOnInit();
    this.cdr.detectChanges();
    // this.enableEdit = false;
    // this.enableEditIndex = null;

    //this.cdr.detectChanges();
  }

  setDataLocally() {
    localStorage.setItem(
      'verificationIdMap',
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
      'verificationIdMap',
      JSON.stringify(Array.from(this.verificationIdMap.entries()))
    );
    this.page = 1;
    this.getSingleApprovals({ page: 1 });
    this.cdr.detectChanges();
  }

  fetchDetails(transfer: singleTransferApprovalModel){
    this.router.navigate([
      `${environment.urlPortalPrefix}/escrow/${transfer.accountId}`,
      {}
    ]);
  }
}

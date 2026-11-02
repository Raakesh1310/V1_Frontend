import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import HttpParameters from '@common/interfaces/httpparams.interface';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { merchantApprovalModel } from '@modules/approvals/models/approvals.model';
import { ApprovalsService } from '@modules/approvals/services';
import { AuthService } from '@modules/auth/services';
import { NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';

@Component({
  selector: 'sbpro-merchant-approval',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './merchant-approval.component.pug',
  styleUrls: ['merchant-approval.component.scss'],
})
export class MerchantApprovalComponent implements OnInit {
  @ViewChild('alert') alert!: HTMLTemplateElement;
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
  data: Array<merchantApprovalModel> = [];
  isLoading = false;
  isChecked = false;
  disableStatusButton = false;
  total$!: number;
  startTimeStamp = 0;
  endTimeStamp = 0;
  page = '1';
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

  ngOnInit() {
    const params = { page: this.page };
    this.isChecked = false;
    this.selectedForOperation = 0;
    this.getMerchantApprovals(params);

    this.approvalList = [
      `Approve (${this.selectedForOperation})`,
      `Reject (${this.selectedForOperation})`,
    ];
  }

  getMerchantApprovals(params: HttpParameters) {
    this.errors = [], this.data = [];
    this.isLoading = true;
    let url = this.getUrl();
    this.approvalService.getMerchantApprovalData(url, params).subscribe(
      (resp: any) => {
        console.log('APPROVALS ', resp);
        if (resp.success) {
          resp.result.forEach((data: any) => {

            let obj: merchantApprovalModel = {
              verificationId: data.verificationId,
              merchantName: data.merchantName,
              merchantId: data.merchantId,
              approvalType: data.action,
              createdAt: data.createdAt,
              level: data.level,
              totalLevel: data.totalLevel,
              approvalsRequired: data.approvalsRequired
            };
            this.data.push(obj);
          });
          console.log('DATA ', this.data);
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

  // TODO: remove if not required
  getUrl(): string {
    if (this.isAdmin) {
      return environment.apiPrefix + '/super-admin/merchant/approvals';
    } else {
      return environment.apiPrefix + '/merchant/approvals';
    }
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

  showDetails(obj: merchantApprovalModel) {
    if (this.isAdmin) {
      this.router
        .navigate([environment.urlAdminPrefix + '/merchant/' + obj.merchantId])
        .then(r => r);
    } else {
      this.router
        .navigate([environment.urlPortalPrefix + '/merchant/' + obj.merchantId])
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
    this.page ='1';
    console.log('PARAMS ', params);
    if (this.startTimeStamp > this.endTimeStamp) {
      this.errors.push('Start Date should be less then End Date');
      return;
    }
    this.getMerchantApprovals(params);
  }

  Search(value: any) {
    console.log('VALUE ', value.target.value);
  }

  rejectionReasonChange(event: any) {
    console.log('VALUE ', event.target.value);
  }

  openDetails(merchantId: string) {
    this.router.navigate([
      environment.urlAdminPrefix + '/merchant/' + merchantId
    ]);
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
  }

  alterMapValue(event: any, merchantApproval: merchantApprovalModel) {
    if (merchantApproval) {
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
          merchantApproval.verificationId,
          event.currentTarget.checked
        );
      } else {
        if (this.verificationIdMap.has(merchantApproval.verificationId)) {
          this.verificationIdMap.delete(merchantApproval.verificationId);
        }
        this.errors.length > 0 &&
          this.verificationIdMap.size + 1 < environment.maxApprovals
          ? (this.errors = [])
          : '';
      }
    }
    this.cdr.detectChanges();
  }

  sendMerchantApprovals() {
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
    let url = this.getUrl();
    let body: object = {
      action: this.selectedStatus,
      verificationIds: verificationIds,
      rejectMessage: this.rejectionReason
    };
    this.approvalService.approvalAction(url, body).subscribe(
      (resp: any) => {
        if (resp.success) {
          this.closeModal();
          this.page = '1';
          this.getMerchantApprovals({ page: this.page });
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

  checkValue(event: any, merchantApproval: merchantApprovalModel) {
    console.log(merchantApproval);
    this.alterMapValue(event, merchantApproval);
    this.selectedForOperation = this.verificationIdMap.size;
    this.approvalList = [
      `Approve (${this.selectedForOperation})`,
      `Reject (${this.selectedForOperation})`
    ];
    this.cdr.detectChanges();
  }

  selectAll(event: any) {

    this.data.forEach(it => {
      it.isSelected = event.currentTarget.checked;
      this.alterMapValue(event, it);
    });
    console.log(this.data);
    this.selectedForOperation = this.verificationIdMap.size;
    this.approvalList = [
      `Approve (${this.selectedForOperation})`,
      `Reject (${this.selectedForOperation})`
    ];
    this.cdr.detectChanges();
  }

  pageChange(event: any) {
    console.log('PAGE ', this.page);
    console.log('PAGE EVENT ', event);
    console.log('VERIFICATION MAP ', this.verificationIdMap);

    // localStorage.setItem(
    //   'verificationIdMap',
    //   JSON.stringify(Array.from(this.verificationIdMap.entries()))
    // );
    this.selectedForOperation = this.verificationIdMap.size; // to send approved count to next page...
    this.isChecked = false;
    const params: any = { page: this.page };
    this.getMerchantApprovals(params);
    this.cdr.detectChanges();
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
    this.page = '1';
    this.getMerchantApprovals({page: '1'});
    this.cdr.detectChanges();
  }
}

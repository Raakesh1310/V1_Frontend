import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OtpModalComponent } from '@common/components';
import HttpParameters from '@common/interfaces/httpparams.interface';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { merchantApprovalModel } from '@modules/approvals/models';
import { ApprovalsService } from '@modules/approvals/services';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { AuthService } from '@modules/auth/services';
import { NgbDateStruct, NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import smsMsg91TemplateId from 'config/smsMsg91TemplateId';
import { environment } from 'environments/environment';

@Component({
    selector: 'sbpro-payee-approval',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './payee-approval.component.pug',
    styleUrls: ['payee-approval.component.scss'],
})
export class PayeeApprovalComponent implements OnInit {
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
    vpa: boolean = false;
    merchantProfile: MerchantProfile | null;
    withOTP: boolean = false;
    otp: string = '';

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
        this.merchantProfile = this.authService.getMerchantProfile();
        this.vpa = this.merchantProfile?.upiPayoutEnabled ? true : false;
        this.withOTP = this.merchantProfile?.payeeAuthorizerSettings?.withOTP;
    }

    ngOnInit() {
        const params = { page: this.page };
        this.isChecked = false;
        this.selectedForOperation = 0;
        this.getPayeeApprovals(params);

        this.approvalList = [
            `Approve (${this.selectedForOperation})`,
            `Reject (${this.selectedForOperation})`,
        ];
    }

    getPayeeApprovals(params: HttpParameters) {
        this.errors = [], this.data = [];
        this.isLoading = true;
        let url = this.getUrl();
        this.approvalService.getPayeeApprovalData(url, params).subscribe(
            (resp: any) => {
                console.log('APPROVALS ', resp);
                if (resp.success) {
                    resp.result.forEach((data: any) => {

                        let obj: any = {
                            verificationId: data.verificationId,
                            accountHolderName: data.data.accountHolderName,
                            accountNumber: data.data.accountNumber,
                            vpa: data.data.vpa,
                            ifsc: data.data.ifsc,
                            bankName: data.data.bankName,
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

    getUrl(): string {
        if (this.isAdmin) {
            return environment.apiPrefix + '/super-admin/payee/approvals';
        } else {
            return environment.apiPrefix + '/payee/approvals';
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
        this.page = '1';
        console.log('PARAMS ', params);
        if (this.startTimeStamp > this.endTimeStamp) {
            this.errors.push('Start Date should be less then End Date');
            return;
        }
        this.getPayeeApprovals(params);
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

    alterMapValue(event: any, payeeApproval: any) {
        if (payeeApproval) {
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
                    payeeApproval.verificationId,
                    event.currentTarget.checked
                );
            } else {
                if (this.verificationIdMap.has(payeeApproval.verificationId)) {
                    this.verificationIdMap.delete(payeeApproval.verificationId);
                }
                this.errors.length > 0 &&
                    this.verificationIdMap.size + 1 < environment.maxApprovals
                    ? (this.errors = [])
                    : '';
            }
        }
        this.cdr.detectChanges();
    }

    sendPayeeApprovals() {
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
            rejectMessage: this.rejectionReason,
            otp: this.otp ? this.otp : null
        };
        this.approvalService.approvalAction(url, body).subscribe(
            (resp: any) => {
                if (resp.success) {
                    this.closeModal();
                    this.page = '1';
                    this.getPayeeApprovals({ page: this.page });
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

    checkValue(event: any, payeeApproval: any) {
        console.log(payeeApproval);
        this.alterMapValue(event, payeeApproval);
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
        this.getPayeeApprovals(params);
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
        this.getPayeeApprovals({ page: '1' });
        this.cdr.detectChanges();
    }

    sendOTP() {
        console.log('opening modal');
        const modalRef: NgbModalRef & {
            componentInstance: OtpModalComponent;
        } = this.modalService.open(OtpModalComponent, {
            backdrop: 'static',
            size: 'md'
        });
        // this.merchantName;
        modalRef.componentInstance.doClose = modalRef;
        modalRef.componentInstance.templateId =
            smsMsg91TemplateId.payeeOtp;
        modalRef.componentInstance.passOtp.subscribe((otp: number) => {
            if (otp) {
                this.otp = otp.toString();
                this.sendPayeeApprovals();
            } else {
                return null;
            }
        });
        return null;
    }
}

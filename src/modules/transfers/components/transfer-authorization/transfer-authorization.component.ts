import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountDocumentDetail } from '@modules/accounts/models';
import { Authorization, Transfer } from '@modules/transfers/models';
import { BulkTransfer } from '@modules/transfers/models/bulk-transfers.model';
import { TransfersAdminService } from '@modules/transfers/services/transferAdmin.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import transferStatus from 'config/transferStatus';
import { environment } from 'environments/environment';
import * as XLSX from 'xlsx';

@Component({
  selector: 'sbpro-transfer-authorization',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transfer-authorization.component.pug',
  styleUrls: ['transfer-authorization.component.scss']
})
export class TransferAuthorizationComponent implements OnInit {
  transferId = '';
  batchId = '';
  verificationId = '';
  token = '';
  transfer = {} as Transfer;
  bulkTransfer = {} as BulkTransfer;
  currentAuth?: Authorization;
  docUrlPrefix = environment.apiHost + '/uploads/accounts/';
  error = '';
  success = '';
  rejected = false;
  approved = false;
  rejectMessage = '';
  modalRef: any;
  transfers: Transfer[] = [];
  approving = false;
  rejecting = false;

  constructor(
    private route: ActivatedRoute,
    private transferService: TransfersAdminService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private _location: Location
  ) {
    this.route.queryParams.subscribe(params => {
      this.token = params.token;
    });
    this.transferId = this.route.snapshot.paramMap.get('transferId') || '';
    if (/^BT\d{10}$/gm.test(this.transferId)) {
      this.batchId = this.transferId;
      this.transferId = '';
    }
    this.verificationId =
      this.route.snapshot.paramMap.get('verificationId') || '';
  }

  ngOnInit() {
    this.transferService.project = [
      'transferId',
      'utr',
      'status',
      'amount',
      'ifsc',
      'beneficiaryAccNumber',
      'beneficiaryIFSC',
      'beneficiaryName',
      'beneficiaryBankName',
      'purpose',
      'accountId',
      'payeeId',
      'createdAt',
      'remarks',
      'createdBy',
      'merchantTitle',
      'documents',
      'authorization',
      'createdBy',
      'document'
    ];

    if (this.transferId) {
      this.transferService.fetchTransfer(this.transferId, this.token).subscribe(
        (res: any) => {
          console.log(res);
          if (res.success) {
            this.transfer = res.result;
            const auths = res.result.authorization;
            console.log(auths);
            this.currentAuth = auths.find(
              (auth: Authorization) =>
                auth.verificationId === this.verificationId
            );
            this.transfer.document = this.transfer.document.filter(
              (doc: AccountDocumentDetail) => doc.deleted === false
            );
            console.log(this.currentAuth);
            this.cdr.detectChanges();
          }
        },
        err => {
          console.log(err.error.errors);
        }
      );
    }

    if (this.batchId) {
      this.transferService
        .fetchBulkTransfer(this.batchId, this.token)
        .subscribe(
          (res: any) => {
            console.log(res);
            if (res.success) {
              this.bulkTransfer = res.result;
              console.log(this.bulkTransfer);
              this.transfers = res.result.transferList;
              console.log(this.transfers);
              const auths = res.result.authorization;
              console.log(auths);
              this.currentAuth = auths.find(
                (auth: Authorization) =>
                  auth.verificationId === this.verificationId
              );
              this.bulkTransfer.document = this.bulkTransfer.document.filter(
                (doc: AccountDocumentDetail) => doc.deleted === false
              );
              console.log(this.currentAuth);
              this.cdr.detectChanges();
            }
          },
          err => {
            console.log(err.error.errors);
          }
        );
    }
  }

  get authorized() {
    let transfer = this.batchId === '' ? this.transfer : this.bulkTransfer;
    if (
      this.currentAuth &&
      !this.currentAuth.verified &&
      transfer.status == transferStatus.PENDING
    ) {
      return false;
    }
    return true;
  }

  approve() {
    this.approving = true;
    if (this.transferId) {
      this.transferService
        .approve(this.transferId, this.verificationId, this.token)
        .subscribe(
          (resp: any) => {
            console.log(resp);
            if (resp.success) {
              this.approved = true;
              this.approving = false;
              this.success = 'Transfer approved successfully.';
              this.cdr.detectChanges();
              this.ngOnInit();
            }
          },
          err => {
            this.approving = false;
            this.error = err.error.errors[0];
            this.cdr.detectChanges();
            console.log(err.error.errors);
          }
        );
    }

    if (this.batchId) {
      this.transferService
        .approveBulkTransfer(this.batchId, this.verificationId, this.token)
        .subscribe(
          (resp: any) => {
            console.log(resp);
            if (resp.success) {
              this.approved = true;
              this.approving = false;
              this.success = 'Bulk Transfer approved successfully.';
              this.cdr.detectChanges();
              this.ngOnInit();
            }
          },
          err => {
            this.approving = false;
            this.error = err.error.errors[0];
            this.cdr.detectChanges();
            console.log(err.error.errors);
          }
        );
    }
  }

  openModal(modal: HTMLElement) {
    this.modalRef = this.modalService.open(modal);
  }

  reject() {
    this.rejecting = true;
    if (this.transferId) {
      this.transferService
        .reject(
          this.transferId,
          this.verificationId,
          this.token,
          this.rejectMessage
        )
        .subscribe(
          (res: any) => {
            if (res.success) {
              this.rejected = true;
              this.rejecting = false;
              this.success = 'Transfer rejected successfully.';
              this.cdr.detectChanges();
              this.ngOnInit();
            }
          },
          err => {
            this.rejecting = false;
            this.error = err.error.errors[0];
            this.cdr.detectChanges();
            console.log(err.error.errors);
          }
        );
    }

    if (this.batchId) {
      this.transferService
        .rejectBulkTransfer(
          this.batchId,
          this.verificationId,
          this.token,
          this.rejectMessage
        )
        .subscribe(
          (res: any) => {
            if (res.success) {
              this.rejected = true;
              this.rejecting = false;
              this.success = 'Bulk Transfer rejected successfully.';
              this.cdr.detectChanges();
              this.ngOnInit();
            }
          },
          err => {
            this.rejecting = false;
            this.error = err.error.errors[0];
            this.cdr.detectChanges();
            console.log(err.error.errors);
          }
        );
    }
  }

  downloadExcel() {
    console.log('DOWNLOADING EXCEL ', this.transfers);
    let heading = [
      [
        'Transfer Id',
        'Beneficiary Name',
        'Account Number',
        'Bank Name',
        'IFSC',
        'Amount',
        'Status',
        'Remarks'
      ]
    ];
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.transfers, {
      header: [
        'transferId',
        'beneficiaryName',
        'beneficiaryAccNumber',
        'beneficiaryBankName',
        'beneficiaryIFSC',
        'amount',
        'status',
        'remarks'
      ]
    });

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bulk Transfer Format');
    XLSX.utils.sheet_add_aoa(ws, heading);

    /* save to file */
    XLSX.writeFile(wb, `${this.batchId}.xlsx`, {
      bookType: 'xlsx',
      type: 'array'
    });
  }

  closeModal() {
    this.modalRef.close();
  }
}

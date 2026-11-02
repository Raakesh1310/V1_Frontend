import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { TransfersAdminService } from '@modules/transfers/services/transferAdmin.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'sbpro-scheduled-transfer-sa-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scheduled-transfer-sa-overview.component.pug',
  styleUrls: ['scheduled-transfer-sa-overview.component.scss']
})
export class ScheduledTransferSaOverviewComponent implements OnInit {
  scheduledTransfers = [];
  selectedTransferId = '';
  searchTerm = '';
  total$!: number;
  page = 1;
  pageSize = 10;
  private modalRef?: NgbModalRef;
  errors: string[] = [];
  rejectionReason = '';

  constructor(
    public transferService: TransfersAdminService,
    public changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('calling schedule transfer api -->>>-->>>->>>');
    this.transferService
      .getScheduledTransfers(this.page, '')
      .subscribe((resp: any) => {
        if (resp.success) {
          console.log('got response --===--==-->>>>', resp);
          resp.result.forEach((element: any) => {
            const jobs = element.job;
            if (jobs.length) {
              jobs.sort(
                (a: any, b: any) =>
                  new Date(a.nextRunAt).getTime() -
                  new Date(b.nextRunAt).getTime()
              );
            }
            element.job = jobs;
          });
          this.scheduledTransfers = resp.result;
          this.total$ = resp.allItemsCount;
          console.log(resp);
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  openModal(alertDialog: any, transferId: any) {
    console.log('Opening alert dialog');
    console.log(transferId);
    this.selectedTransferId = transferId;
    this.modalRef = this.modalService.open(alertDialog, {
      backdrop: 'static',
      centered: true
    });
  }

  stopRecurringTransfer() {
    console.log(this.rejectionReason);
    if (this.rejectionReason === '') {
      return;
    }
    this.transferService
      .stopRecurringTransfer(this.selectedTransferId, this.rejectionReason)
      .subscribe((resp: any) => {
        console.log('stopRecurringTransfer---===>', resp);
        this.closeModal();
        this.fetchData(this.page, this.searchTerm);
        this.rejectionReason = '';

        this.changeDetectorRef.detectChanges();
      });
  }

  submitSearchForm() {
    this.fetchData(this.page, this.searchTerm);
  }

  clearSearchForm() {
    (this.searchTerm = ''), (this.page = 1);
    this.fetchData(this.page, this.searchTerm);
  }

  fetchData(p: number, s: string) {
    this.transferService.getScheduledTransfers(p, s).subscribe(
      (resp: any) => {
        this.scheduledTransfers = resp.result;
        this.total$ = resp.allItemsCount;
        console.log(resp);
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.errors.push(error);
        console.log(this.errors);
        this.closeModal();
        this.changeDetectorRef.detectChanges();
      },
      () => {
        // 'onCompleted' callback.
        // No errors, route to new page here
        this.closeModal();
        this.changeDetectorRef.detectChanges();
      }
    );
  }

  closeModal() {
    this.modalRef?.close();
  }

  open(id: string) {
    this.router
      .navigate([environment.urlAdminPrefix + `/transfer/scheduled/` + id])
      .then(r => r);
  }

  pageChange(event: any) {
    this.fetchData(this.page, this.searchTerm);

    this.changeDetectorRef.detectChanges();
  }
}

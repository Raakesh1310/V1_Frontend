import { Component, Input, OnInit } from '@angular/core';
import { FixedDepositDetail } from '@modules/fixed-deposit/models';
import { FixedDepositService } from '@modules/fixed-deposit/services';
import { Transaction } from '@modules/transactions/models';
import { NgbCalendar, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { FdCloseComponent } from '../fd-close/fd-close.component';
import { FixedDepositFormComponent } from '../fixed-deposit-form/fixed-deposit-form.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'sbpro-fixed-deposit-list',
  templateUrl: './fixed-deposit-list.component.pug',
  styleUrls: ['./fixed-deposit-list.component.scss']
})
export class FixedDepositListComponent implements OnInit {
  constructor(
    private modalService: NgbModal,
    private fdService: FixedDepositService,
    private calendar: NgbCalendar
  ) {
    this.fds$ = this.fdService._fds$;
    this.total$ = this.fdService._total$;
  }
  @Input() accountId = '';
  fds$!: Observable<FixedDepositDetail[]>;
  total$!: Observable<number>;
  excelHeaders = [
      'ID',
      'Amount (in Rs.)',
      'Amount Blocked (in Rs.)',
      'Value Date',
      'Tenure',
      'Maturity Date',
      'Interest',
      'Acc. Number',
      'Status',
    ];

  ngOnInit(): void {
    this.fdService.accountId = this.accountId;
    console.log(this.accountId);
    this.loadData();
  }

  downloadExcel() {
    var excelData = [this.excelHeaders]

    this.fdService.retrieveData(-1).subscribe(
      resp => {
        resp.result.forEach(element => {
          excelData.push(
            [element.fixedDepositId,
            element.amount,
            element.amountBlocked,
            element.valueDate.toString(),
            element.tenure.toString(),
            element.maturityDate.toString(),
            element.interestINR.toString(),
            element.accountId.toString(),
            element.status
            ])
        });
        // var temp = resp.toSring();
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);

        /* generate workbook and add the worksheet */
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Payee Format');

        /* save to file */
        XLSX.writeFile(wb, 'Payee_Format.xlsx', {
          bookType: 'xlsx',
          type: 'array'
        });
      }
    )
  }

  loadData() {
    this.fdService.page = 1;
    this.fdService.retrieveData().subscribe();
  }

  clearForm() {
    // tslint:disable-next-line:no-any
    (this.fdService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    )),
      // tslint:disable-next-line:no-any
      (this.fdService.dateTo = this.calendar.getNext(
        new NgbDate(0, 0, 0),
        'd',
        0
      )),
      this.loadData();
  }

  createFD() {
    const modalRef = this.modalService.open(FixedDepositFormComponent, {
      size: 'lg'
    });
    modalRef.componentInstance.accountId = this.accountId;
    modalRef.componentInstance.doClose = modalRef;
    modalRef.result.then((result: boolean) => {
      if (result) {
        this.loadData();
      }
    });
  }

  updateFD(fd: FixedDepositDetail) {
    const modalRef = this.modalService.open(FixedDepositFormComponent, {
      size: 'lg'
    });
    modalRef.componentInstance.accountId = this.accountId;
    modalRef.componentInstance.fd = fd;
    modalRef.componentInstance.doClose = modalRef;
    modalRef.result.then((result: boolean) => {
      if (result) {
        this.loadData();
      }
    });
  }

  closeFD(fd: FixedDepositDetail) {
    const modalRef = this.modalService.open(FdCloseComponent, {
      size: 'lg'
    });
    modalRef.componentInstance.fd = fd;
    modalRef.componentInstance.doClose = modalRef;
    modalRef.result.then((result: boolean) => {
      if (result) {
        this.loadData();
      }
    });
  }
}

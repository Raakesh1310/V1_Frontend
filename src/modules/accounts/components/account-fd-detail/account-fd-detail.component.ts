import { Component, Input, OnInit } from '@angular/core';
import { DoqfyFormComponentComponent } from '@modules/documents/components';
import { FixedDepositFormComponent } from '@modules/fixed-deposit/components';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-account-fd-detail',
  templateUrl: './account-fd-detail.component.pug',
  styleUrls: ['./account-fd-detail.component.scss']
})
export class AccountFdDetailComponent implements OnInit {
  modalRef?: NgbModalRef;
  @Input() accountId = '';

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {}

  openFDModal() {
    const modalRef = this.modalService.open(FixedDepositFormComponent, {
      size: 'sm'
    });
    modalRef.componentInstance.accountId = this.accountId;
    modalRef.componentInstance.doClose = modalRef;
    modalRef.result.then((result: boolean) => {});
  }
}

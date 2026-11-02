import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Account } from '@modules/accounts/models/accounts.model';
import { AccountsAdminService } from '@modules/accounts/services';
import { DoqfyFormComponentComponent } from '@modules/documents/components';
import { DocumentsService } from '@modules/documents/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';

@Component({
  selector: 'sbpro-account-documents',
  templateUrl: './account-documents.component.pug',
  styleUrls: ['./account-documents.component.scss']
})
export class AccountDocumentsComponent implements OnInit {
  @Input() accountId = '';
  @Input() apiLink = '';
  @Input() uploadLink = '';
  @Input() readOnly = false;
  modalRef?: NgbModalRef;
  account?: Account;
  docUrlPrefix: string = environment.apiHost + '/uploads/accounts/';
  generating = false;
  refreshing = false;
  loading = true;

  constructor(
    private modalService: NgbModal,
    private documentService: DocumentsService,
    private accountAdminService: AccountsAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getAccount();
  }

  openEsign() {
    const modalRef = this.modalService.open(DoqfyFormComponentComponent, {
      size: 'xl'
    });
    modalRef.componentInstance.apiLink = this.apiLink;
    modalRef.componentInstance.uploadLink = this.uploadLink;
    modalRef.componentInstance.accountId = this.accountId;
    modalRef.componentInstance.doClose = modalRef;
    modalRef.result.then((result: boolean) => {
      if (result) {
        this.getAccount();
      }
    });
  }

  getOrder(docId: string) {
    return this.account?.agreements.filter(
      order => order.documentId === docId
    )[0];
  }

  async generateFile(documentUuid: string) {
    this.generating = true;
    if (documentUuid) {
      await this.documentService
        .getDownloadableLink(documentUuid)
        .subscribe((resp: any) => {
          console.log(resp);
          this.getAccount();
        });
    }
  }

  refreshStatus() {
    this.refreshing = true;
    const orders = this.account?.orders.map(order => order.orderUuid) || [];
    orders.forEach(order =>
      this.documentService.refreshOrder(order).subscribe()
    );
    this.getAccount();
  }

  getAccount() {
    this.accountAdminService.project = ['agreements', 'accountId', 'documents'];
    console.log('account details fetching for ', this.accountId);
    this.accountAdminService
      .getAccount(this.accountId)
      .subscribe((resp: any) => {
        if (resp.success) {
          this.loading = false;
          this.refreshing = false;
          this.generating = false;
          this.account = resp.result;
          this.cdr.detectChanges();
        }
        console.log(this.account);
      });
  }

  ngOnDestroy() {
    this.accountAdminService.setDefault();
  }
}

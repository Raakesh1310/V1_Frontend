import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { OtpModalComponent } from '@common/components';
import { AccountDocumentDetail } from '@modules/accounts/models';
import {
  AccountDocumentService,
  AccountsService
} from '@modules/accounts/services';
import { AuthService } from '@modules/auth/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

import { UtilityService } from '@common/services';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import smsMsg91TemplateId from '../../../../config/smsMsg91TemplateId';

@Component({
  selector: 'sbpro-account-document-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-document-form.component.pug',
  styleUrls: ['account-document-form.component.scss']
})
export class AccountDocumentFormComponent implements OnInit {
  selectedDoc = '';
  @Input() public accountId = '';
  @Input() public viewMode = false;
  @Input() public readOnly = false;
  @ViewChild('myInput')
  myInputVariable: ElementRef | null = null;
  errors: any = [];
  uploading = false;
  docs$!: Observable<AccountDocumentDetail[]>;
  docs: AccountDocumentDetail[] = [];
  downloadFolderName = S3FolderName.ACCOUNT;
  @Input() currentTab = 0;
  @Input() merchantId = '';
  @Output() emitCurrentTab: EventEmitter<number> = new EventEmitter<number>();

  private _loadingList$ = new BehaviorSubject(false);
  public isAdmin = false;
  constructor(
    private accountDocumentService: AccountDocumentService,
    private cdr: ChangeDetectorRef,
    private accountsService: AccountsService,
    private router: Router,
    private modalService: NgbModal,
    private _location: Location,
    private authService: AuthService,
    private utilityService: UtilityService
  ) {
    localStorage.removeItem('account_bool');
    this.isAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit() {
    this.getDocuments();
    // this.currentTab = this.currentTab + 1;
    this.emitCurrentTab.emit(this.currentTab);
  }

  getDocuments() {
    this._loadingList$.next(true);
    this.accountDocumentService.performSearch(this.accountId);
    this.accountDocumentService.docs$.subscribe(resp => {
      this._loadingList$.next(false);
      this.docs = resp;
    });
    this.docs$ = this.accountDocumentService.docs$;
    this.cdr.detectChanges();
  }

  public downloadFile($event: Event, fileHash: string, fileName?: string) {
    this.utilityService.downloadFile(
      $event,
      fileHash,
      this.downloadFolderName,
      fileName
    );
  }
  /*
  Documents Form
  */

  // form validators
  docUp() {
    const element: HTMLElement = document.getElementById(
      'ndocs'
    ) as HTMLElement;
    element.click();
  }

  onfileChange($event: any) {
    this.uploading = true;
    const formdata = new FormData();
    formdata.append('docType', this.selectedDoc);
    formdata.append('file', $event.target.files[0]);
    this.accountDocumentService
      .uploadDocument(this.accountId, formdata)
      .subscribe(
        (resp: any) => {
          localStorage.setItem('account_bool', 'false');
          console.log('ACCOUNT BOOL SET TO TRUE');
          this.uploading = false;
          if (resp.success) {
            console.log(resp);
            this.getDocuments();
          } else {
            console.log(resp);
          }
          this.cdr.detectChanges();
        },
        err => {
          console.log(err.error.errors);
          this.errors = err.error.errors;
          this.cdr.detectChanges();
        }
      );
    this.selectedDoc = '';
    if (this.myInputVariable) {
      this.myInputVariable.nativeElement.value = null;
    }
  }

  deleteDoc(docId: string) {
    this.accountDocumentService.deleteDocument(this.accountId, docId).subscribe(
      (resp: any) => {
        console.log(resp);
        localStorage.setItem('account_bool', 'true');
        console.log('ACCOUNT BOOL SET TO FALSE');
        if (resp.success) {
          this.getDocuments();
          this.cdr.detectChanges();
        } else {
          /**
           * show toast here
           */
          console.log('error while deleting...');
        }
      },
      err => {
        console.log(err.error.errors);
        this.errors = err.error.errors;
        this.cdr.detectChanges();
      }
    );
  }

  activate() {
    if (this.docs.length < 1) {
      return;
    }

    // if (this.isAdmin) {
    //   return this.activateFromAdmin();
    // } else {
    return this.activateAccount();
    // }
  }

  activateAccount() {
    const modalRef: NgbModalRef & {
      componentInstance: OtpModalComponent;
    } = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.doClose = modalRef;
    modalRef.componentInstance.header = 'Activate Escrow';
    modalRef.componentInstance.templateId = smsMsg91TemplateId.accountCreateOtp;
    modalRef.componentInstance.passOtp.subscribe((otp: number) => {
      if (otp) {
        this.accountDocumentService
          .activateAccount(this.accountId, otp.toString(), this.merchantId)
          .subscribe(
            (resp: any) => {
              if (resp.success) {
                this.accountsService.performSearch();
                this.router.navigate([
                  this.isAdmin
                    ? environment.urlAdminPrefix + '/escrow'
                    : environment.urlPortalPrefix + '/escrow',
                  {}
                ]);
                return;
              }
              this.errors = resp.errors;
              this.cdr.detectChanges();
            },
            err => {
              console.log(err.error.errors);
              this.errors = err.error.errors;
              this.cdr.detectChanges();
            }
          );
      } else {
        console.log('something went wrong with modal');
      }
    });
  }

  activateFromAdmin() {
    this.accountDocumentService
      .activateAccount(this.accountId, undefined, this.merchantId)
      .subscribe(
        (resp: any) => {
          if (resp.success) {
            this.accountsService.performSearch();
            this.router.navigate([
              this.isAdmin
                ? environment.urlAdminPrefix + '/escrow'
                : environment.urlPortalPrefix + '/escrow',
              {}
            ]);
            return;
          }
          this.errors = resp.errors;
          this.cdr.detectChanges();
        },
        err => {
          console.log(err.error.errors);
          this.errors = err.error.errors;
          this.cdr.detectChanges();
        }
      );
  }

  goBack() {
    this._location.back();
  }
}

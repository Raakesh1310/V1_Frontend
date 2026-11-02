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
import { ActivatedRoute, Router } from '@angular/router';
import { AccountDocumentDetail } from '@modules/accounts/models';
import { AccountDocumentService } from '@modules/accounts/services';
import { AuthService } from '@modules/auth/services';
import { BehaviorSubject, Observable } from 'rxjs';

import { UtilityService } from '@common/services';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import merchantUserRoles from 'config/merchantUserRoles';
import { BankAccountService } from '@modules/bank-account/services';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'sbpro-connected-banking-agreement',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './connected-banking-agreement.component.pug',
  styleUrls: ['connected-banking-agreement.component.scss']
})
export class ConnectedBankingAgreementComponent implements OnInit {
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
  downloadFolderName = S3FolderName.ESCROW_AGREEMENT;
  @Input() currentTab = 0;
  @Input() merchantId = '';
  @Output() emitCurrentTab: EventEmitter<number> = new EventEmitter<number>();
  bankAccountNo: string = '';

  private _loadingList$ = new BehaviorSubject(false);
  public isAdmin = false;
  roles: string[] = [];
  isMerchantAuthorizer = false;
  constructor(
    private bankAccountService: BankAccountService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private _location: Location,
    private authService: AuthService,
    private utilityService: UtilityService,
    private activatedRoute: ActivatedRoute
  ) {
    this.bankAccountNo =
      activatedRoute.snapshot.paramMap.get('accountId') || '';
    localStorage.removeItem('account_bool');
    this.isAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit() {
    this.getDocuments();
    this.currentTab = 2;
    this.emitCurrentTab.emit(this.currentTab);
    this.checkForReadOnly();
    this.cdr.detectChanges();
  }

  checkForReadOnly() {
    this.roles = this.authService.getRole();

    this.isAdmin = this.authService.isSuperAdmin();

    this.isMerchantAuthorizer =
      this.roles?.indexOf(merchantUserRoles.MERCHANT_AUTHORIZER) > -1
        ? true
        : false;

    if ((this.roles && this.isMerchantAuthorizer) || !this.isAdmin) {
      this.readOnly = true;
    }
  }

  getDocuments() {
    this._loadingList$.next(true);
    this.bankAccountService
      .getBankAccountDocs(this.bankAccountNo)
      .subscribe(resp => {
        this._loadingList$.next(false);
        this.docs = resp.result;
        this.cdr.detectChanges();
      });
    // this.accountDocumentService.docs$.subscribe(resp => {
    //   this._loadingList$.next(false);
    //   this.docs = resp;
    // });
    // this.docs$ = this.accountDocumentService.docs$;
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

  // form validators
  docUp() {
    const element: HTMLElement = document.getElementById(
      'ndocs'
    ) as HTMLElement;
    element.click();
  }

  onfileChange($event: any) {
    this.errors = [];
    this.uploading = true;
    const formdata = new FormData();
    formdata.append('docType', this.selectedDoc);
    formdata.append('file', $event.target.files[0]);

    if (this.docs.length >= 10) {
      this.errors = ['Max 10 documents are allowed.'];
      $event.target.value = '';
      this.uploading = false;
      this.cdr.detectChanges();
      return;
    }

    if ($event.target.files.length > 0) {
      const fileSize = $event.target.files[0].size;
      if (fileSize > environment.maxSize) {
        this.errors = [
          'File size exceeds the allowed limit (10MB). Please choose a smaller file.'
        ];
        $event.target.value = '';
        this.uploading = false;
        this.cdr.detectChanges();
        return;
      }
    }

    this.bankAccountService
      .uploadBankAccountDocument(this.bankAccountNo, formdata)
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

  validateFileSize(input: any) {
    const maxSize = 10 * 1024 * 1024; // 5MB in bytes
    if (input.files.length > 0) {
      const fileSize = input.files[0].size;
      if (fileSize > maxSize) {
        this.errors = [
          'File size exceeds the allowed limit (10MB). Please choose a smaller file.'
        ];
        this.cdr.detectChanges();
        // You can also reset the file input to clear the selected file
        input.value = '';
      }
    }
  }

  deleteDoc(docId: string) {
    this.bankAccountService.deleteDocument(this.bankAccountNo, docId).subscribe(
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

  goBack() {
    this._location.back();
  }
}

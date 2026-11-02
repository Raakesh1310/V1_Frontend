import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { ModalInfoComponent } from '@common/components/modal-info/modal-info.component';
import {
  AccountDescriptionRespModel,
  AccountPayeeDetail
} from '@modules/accounts/models';
import { AccountsResponseModel } from '@modules/accounts/models/accounts-response.model';
import { Account } from '@modules/accounts/models/accounts.model';
import {
  AccountPayeeService,
  AccountsAdminService,
  AccountsService
} from '@modules/accounts/services';
import { DocumentsService } from '@modules/documents/services';
import {
  NgbDateStruct,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '@modules/auth/services';
import * as htmlToImage from 'html-to-image';

@Component({
  selector: 'sbpro-account-detail',
  templateUrl: './account-detail.component.pug',
  styleUrls: ['./account-detail.component.scss']
})
export class AccountDetailComponent implements OnInit {
  @Input() accountId = '';
  @Input() isAdmin = false;
  @Input() readOnly = false;
  @Input() draftShareUnit = '%';
  merchantId: string = '';
  merchantName!: string;
  shareSum = 0;
  isAuto?: boolean = false;

  account?: Account;
  linkedPayees$!: Observable<AccountPayeeDetail[]>;
  @Input() draftPayees: AccountPayeeDetail[] = [];
  @Output() emitShareUnit: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitMerchantId: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitSelectedBank: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitAutoTransfer: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() emitAutoTransferType: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitScheduledAt: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitRetentionAmount: EventEmitter<number> = new EventEmitter<number>();

  loading$ = new BehaviorSubject(false);
  accountForm!: FormGroup;
  editMode = false;
  updating = false;
  errors: string[] = [];
  linkedPayees: any[] = [];
  unlinkedPayees: AccountPayeeDetail[] = [];
  model!: NgbDateStruct;
  modalRef?: NgbModalRef;
  detailsModal?: NgbModalRef;
  @ViewChild('detailsTemplate')
  private detailsTemplate!: TemplateRef<any>;
  qrCode = '';
  upiId = '';
  invalidEmails: string[] = [];
  email_regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  phonepe = '../../../../assets/img/payment_app_logos/PhonePe-Logo.wine.png';
  paytm = '../../../../assets/img/payment_app_logos/Paytm-Logo.wine.png';
  gpay = '../../../../assets/img/payment_app_logos/Google_Pay-Logo.wine.png';
  rbl = '../../../../assets/img/rbl.png';

  @ViewChild('screen') screen: any;

  constructor(
    private formBuilder: FormBuilder,
    private documentService: DocumentsService,
    private accountAdminService: AccountsAdminService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private _location: Location,
    private accountsService: AccountsService,
    private accountPayeeService: AccountPayeeService,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.accountForm = this.formBuilder.group({
      name: [null],
      purpose: [null],
      email: [null, [Validators.email, this.validateMultipleEmails()]],
      validity: [null],
      startDate: [null],
      expectedVolume: [null],
      isRetentionChecked: [null],
      retentionAmount: [null]
    });
    this.getAccount();
    // this.merchantName = this.authService.getTitle();
  }

  /**
   *
   * @returns Null value if comma seprated email are not valid, else returns emailValidationError
   */
  validateMultipleEmails() {
    return (input: FormControl) => {
      const emails = input.value?.split(',').map((val: string) => val.trim());

      if (!emails) return null;
      this.invalidEmails = [];
      for (let email of emails) {
        if (!this.email_regex.test(email)) {
          this.invalidEmails.push(email);
        }
      }
      const returnValue =
        this.invalidEmails.length <= 0 ? null : { emailValidationError: true };
      return returnValue;
    };
  }

  /**
   * get functions
   */
  getLinkedPayee() {
    this.loading$.next(true);
    this.accountPayeeService.getLinkedPayee(this.accountId, this.merchantId);
    this.accountPayeeService.payees$.subscribe(() => {
      this.loading$.next(false);
    });
    this.linkedPayees$ = this.accountPayeeService.payees$;
    this.linkedPayees$.subscribe(p => {
      if (_.isArray(p) && !_.isEmpty(p)) {
        this.linkedPayees = _.uniqBy(
          [...p, ...this.draftPayees],
          pay => pay.payeeId
        );
      } else {
        this.linkedPayees = _.uniqBy([...this.draftPayees], pay => pay.payeeId);
      }
      console.log('RESPONSE EMITTED ', this.linkedPayees);
      if (this.linkedPayees.length === 0) {
        localStorage.setItem('account_bool', 'true');
      }
      this.getUnlinkedPayee('');
      this.shareSum = this.linkedPayees.reduce((a, b: any) => a + b.share, 0);
      this.shareSum = Number.parseFloat(this.shareSum.toFixed(2));
      this.cdr.detectChanges();
    });
  }

  getUnlinkedPayee(term: string) {
    this.loading$.next(true);
    this.accountPayeeService.getUnlinkedPayee(
      this.accountId,
      term,
      this.merchantId
    );
    this.accountPayeeService.unlinkedPayees$.subscribe(resp => {
      this.loading$.next(false);
      this.unlinkedPayees = _.differenceBy(resp, this.linkedPayees, 'payeeId');
      this.cdr.detectChanges();
    });
  }

  get name() {
    return this.accountForm.controls.name.value;
  }

  get purpose() {
    return this.accountForm.controls.purpose.value;
  }
  get email() {
    return this.accountForm.controls.email.value;
  }
  get validity() {
    return this.accountForm.controls.validity.value;
  }
  get startDate() {
    return this.accountForm.controls.startDate.value;
  }
  get expectedVolume() {
    return this.accountForm.controls.expectedVolume.value;
  }

  get emailControl() {
    return this.accountForm.get('email') as FormControl;
  }

  get emailControlValid() {
    return this.emailControl.touched && !this.emailControlInvalid;
  }

  get emailControlInvalid() {
    return (
      this.emailControl.touched &&
      (this.emailControl.hasError('required') ||
        this.emailControl.hasError('emailValidationError'))
    );
  }

  getAccount() {
    this.loading$.next(true);
    this.accountAdminService.getAccount(this.accountId).subscribe(resp => {
      console.log(resp);
      if (resp.success) {
        this.loading$.next(false);
        // @ts-ignore
        this.account = resp.result;
        this.emitSelectedBank.emit(this.account!.bank);
        this.merchantName = this.account?.merchantTitle || '';
        this.upiId = this.account?.vpa || '';
        // console.log('\n\n\n\n\n emitting -- >', this.account?.shareUnit);
        this.emitShareUnit.emit(this.account?.shareUnit);
        this.merchantId = this.account?.merchantId
          ? this.account.merchantId
          : '';
        this.emitMerchantId.emit(this.account?.merchantId);
        this.isAuto = Boolean(this.account?.isAutoTransfer);
        this.emitAutoTransfer.emit(this.isAuto);
        this.emitAutoTransferType.emit(this.account?.autoTransferType);
        this.emitScheduledAt.emit(this.account?.autoScheduledAt);

        if (this.account?.retentionAmount) {
          this.accountForm.controls.isRetentionChecked.setValue(true);
          this.accountForm.controls.retentionAmount.setValue(
            Number.parseFloat(this.account?.retentionAmount)
          );
        this.emitRetentionAmount.emit(Number.parseFloat(this.account?.retentionAmount))
        }

        this.accountForm.controls.name.setValue(this.account?.name);
        this.accountForm.controls.purpose.setValue(this.account?.purpose);
        this.accountForm.controls.email.setValue(this.account?.email);
        this.accountForm.controls.validity.setValue(this.account?.validity);
        this.accountForm.controls.startDate.setValue(this.account?.startDate);
        this.accountForm.controls.expectedVolume.setValue(
          this.account?.expectedVolume
        );

        this.cdr.detectChanges();
        this.getLinkedPayee();
      }
    });
  }

  update() {
    this.updating = true;

    let body = this.accountForm.value;

    for (let key of Object.keys(body)) {
      // Remove isRetetntionChecked
      if (body[key] === null) {
        delete body[key];
      }
    }

    if (!body.isRetentionChecked) {
      delete body.retentionAmount;
    }
    delete body.isRetentionChecked;

    if (body.startDate && typeof body.startDate === 'object') {
      body.startDate = new Date(
        body.startDate.year,
        body.startDate.month - 1,
        body.startDate.day
      ).toISOString();
    }

    if (
      this.accountForm.controls.isRetentionChecked.value &&
      this.accountForm.controls.retentionAmount.value
    ) {
      body.retentionAmount = this.accountForm.controls.retentionAmount.value.toString();
    }
    body.isAutoTransfer = this.isAuto?.toString();
    // body.merchantId = this.merchantId;
    body.email = this.accountForm.controls.email.value
      ?.split(',')
      .map((val: string) => val.trim())
      .join(',');

    this.accountAdminService.update(this.accountId, body, this.merchantId).subscribe(
      (resp: AccountsResponseModel) => {
        if (resp.success) {
          this.updating = false;
          this.editMode = false;
          this.getAccount();
          this.cdr.detectChanges();
        } else {
          this.errors.push('Error updating account');
        }
      },
      err => {
        this.errors = [...this.errors, ...err.error.errors];
        this.updating = false;
        this.cdr.detectChanges();
      }
    );
  }

  checkboxAction(checkbox: HTMLInputElement, content: ElementRef) {
    if (checkbox.checked) {
      /**
       * if checkbox is checked
       */
      this.errors = [];
      if (this.draftShareUnit === 'INR') {
        /**
         * ERROR - Not %
         */
        this.errors.push(
          'Auto transfer feature only applicable when payout unit is in %'
        );
        checkbox.checked = false;
        return;
      }
      const modalRef = this.modalService.open(ModalInfoComponent, {
        backdrop: 'static',
        size: 'lg'
      });
      modalRef.componentInstance.doClose = modalRef;
      modalRef.componentInstance.passEntry.subscribe((resp: boolean) => {
        if (resp) {
          /**
           * ERROR - 100% share
           */
          if (this.shareSum !== 100) {
            this.errors.push(
              'Payout share of all the payees should be equal to 100%'
            );
            checkbox.checked = false;
            this.cdr.detectChanges();
            return;
          }
          this.isAuto = true;
          this.cdr.detectChanges();
        } else {
          this.isAuto = false;
          this.cdr.detectChanges();
          checkbox.checked = false;
        }
      });
    } else {
      /**
       * if checkbox is unchecked
       */
      this.accountForm.controls.isRetentionChecked.setValue(false);
      this.accountForm.controls.retentionAmount.setValue(0.0);
      this.isAuto = false;
      this.cdr.detectChanges();
    }
  }

  goBack() {
    this._location.back();
  }

  /**
   * Generates QR Code
   * @param accountId
   */
  public getQRCode(accountId: string) {
    this.accountsService.getQRCode(accountId).subscribe((resp: any) => {
      if (resp.success) {
        if (resp.result.qrCode.length > 0) {
          this.qrCode = resp.result.qrCode;
        }
      }
    });
  }

  /**
   * Opens modal to display QR
   * @param modal
   */
  openQRModal(modal: TemplateRef<any>) {
    this.detailsModal = this.modalService.open(modal, {
      backdrop: 'static',
      size: 'md'
    });
  }

  /**
   * Wrapper () to generate QR
   * and display on modal
   * called from show Qr button
   * @param accountId
   * @param vpa
   */
  showQRCode(accountId: string, vpa: string) {
    this.spinner.show();
    this.getQRCode(accountId);
    this.upiId = vpa;
    this.openQRModal(this.detailsTemplate);
    this.spinner.hide();
    this.cdr.detectChanges();
  }

  /**
   * close modal
   */
  onCancel() {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.detailsModal?.close();
    this.cdr.detectChanges();
  }
  /**
   * Download QR Code
   * @param upiId
   */
  downloadQR(upiId: string) {
    htmlToImage
      .toPng(document.getElementById('screen') as HTMLElement)
      .then(function(dataUrl) {
        var link = document.createElement('a');
        link.download = upiId + '.png';
        link.href = dataUrl;
        link.click();
      });
  }
}

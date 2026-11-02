import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OtpModalComponent } from '@common/components';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService, UtilityService } from '@common/services';
import accountsStatus from '@modules/accounts/constants/accountsStatus';
import { Account } from '@modules/accounts/models';
import {
  AccountPayeeService,
  AccountsService
} from '@modules/accounts/services';
import { Merchant } from '@modules/auth/models/merchant.model';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { AuthService } from '@modules/auth/services';
import { ProfileService } from '@modules/profile/services';
import banksAllowedUPI from '@modules/transfers/constants/banksAllowedUPI';
import { Transfer, TransferDocumentDetail } from '@modules/transfers/models';
import { TransferDocumentService } from '@modules/transfers/services/transfer-document.service';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Observable } from 'rxjs';
import smsMsg91TemplateId from '../../../../config/smsMsg91TemplateId';
import { environment } from '../../../../environments/environment';
import { VpaService } from '@modules/vpa/services';
import { TransfersService } from '@modules/transfers/services';
import bankTypeArrayConstant from '@common/constants/bankTypeArray.constant';
import banksTypes from '@modules/accounts/constants/banksTypes';
import { PayeeService } from '@modules/payee/services';
import { Payee } from '@modules/payee/models';
import payeeAccountType from 'config/payeeAccountType';

@Component({
  selector: 'sbpro-upi-transfer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './upi-transfer.component.pug',
  styleUrls: ['upi-transfer.component.scss']
})
export class UpiTransferComponent implements OnInit {
  // form data holder
  docUrlPrefix = environment.apiHost + '/uploads/transfers/single-transfers/';
  transferForm!: FormGroup;
  accounts!: Account[];
  purpose = '';
  payees: Payee[] = [];

  selectedAccount: any = null;
  selectedBankAccount: any = null;
  selectedAmount: any = null;
  submitted = false;
  isTCAccepted = false;
  // error handler
  errors!: string[];
  // data observable
  accounts$!: Observable<Account[]>;
  merchants: Merchant[] = [];
  selectedMerchant: Merchant | undefined;

  createTransferError = '';

  dropdownSettings = {};
  addSupportingDocuments = false;
  transferId: string = '';
  uploading = false;
  @ViewChild('myInput')
  myInputVariable: ElementRef | null = null;
  selectedPayee: any;
  payees$!: Observable<Payee[]>;

  formatsAllowed = '.png,.jpg,.pdf,.xlsx,.xls,.csv,.doc,.docx';

  fileExtentionRegex = new RegExp(
    `^.*(${this.formatsAllowed.split(',').join('|')})$`
  );
  uploadedDocuments: TransferDocumentDetail[] = [];

  profile!: MerchantProfile | null;
  downloadFolderName = S3FolderName.SINGLE_TRANSFERS;

  upiFormatRegex = /^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$/;
  upiPayoutEnabled: boolean = false;
  vpaHolderName!: string;
  vpaHolderNameError!: string;
  _lastBankAccount: any;
  bankAccounts: any;
  @Input() connectedBanking = false;
  pendingBalance!: number;
  activeBalance!: number;
  banks: string[] = [];
  isAdmin = false;
  selectedBank!: string;
  merchantId!: string;
  vpa!: string;
  isRetention!: boolean;
  // constructor
  constructor(
    private formBuilder: FormBuilder,
    private vpaService: VpaService,
    private transferService: TransfersService,
    private transferDocumentService: TransferDocumentService,
    private router: Router,
    private utilService: UtilityService,
    private accountService: AccountsService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private profileService: ProfileService,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private payeeService: PayeeService,
    private accountPayeeService: AccountPayeeService
  ) {
    this.errors = [];
    this.isAdmin = this.authService.isSuperAdmin();
    this.profile = this.authService.getMerchantProfile();
    // this.payeeService.vpa = true;
  }

  // angular initializer
  ngOnInit() {
    console.log(this.profile);
    this.banks = [];
    if (this.isAdmin) {
      this.banks = bankTypeArrayConstant;
    } else {
      this.assignBanks();
    }

    // initialize form
    this.transferForm = this.formBuilder.group({
      //bankAccount OR vpa
      account: [this.selectedAccount],
      bankAccount: [this.selectedAccount],
      amount: ['', [Validators.required, Validators.min(1)]],
      name: ['', [Validators.required]],
      vpa: ['', [Validators.required]],
      otp: ['', [Validators.required]],
      purpose: [''],
      tcCheckBox: [false]
    });

    // this.transferForm.valueChanges.subscribe(data => {
    // if (this.selectedAccount) {
    this.profileService
      .getProfile(this.selectedAccount?.merchant, false)
      .subscribe(resp => {
        if (resp.success) {
          // this.connectedBanking = resp.result.connectedBanking;
          this.profile = resp.result;
          const bankHasUPIAccess = !!_.filter(resp.result.banks, bank =>
            banksAllowedUPI.includes(bank.bankName)
          ).length;

          this.upiPayoutEnabled =
            bankHasUPIAccess && resp.result.upiPayoutEnabled;
          this.merchantId = resp.result.merchantId;
        }

        this.cdr.detectChanges();
      });
    // }

    // if (data.account === null || data.transferTo === '') return;

    // this._lastBankAccount = data.account.accountId;
    // });
  }

  getAccounts() {
    if (!this.connectedBanking) {
      this.transferForm.controls.account.reset();
      this.accountService.performSearch(
        accountsStatus.ACTIVE,
        '',
        this.selectedBank
      );
      this.accountService.account$.subscribe(resp => {
        this.accounts = resp;
      });
      this.cdr.detectChanges();
    } else {
      this.transferForm.controls.bankAccount.reset();
      this.getBankAccounts(this.merchantId, this.selectedBank);
      this.cdr.detectChanges();
    }
  }

  private _verifyingVPA$ = new BehaviorSubject(false);

  updateBankAccount(event: any) {
    this.transferForm.controls.vpa.reset();
    this.vpaHolderName = '';
    this.selectedBankAccount = event;
    this.getActiveBalance(
      this.selectedBankAccount.merchantId,
      this.selectedBankAccount.bankAccountNo,
      this.selectedBankAccount.bankName
    );
    this.payeeService.type = payeeAccountType.vpa;
    this.getPayees(-1);
    this.cdr.detectChanges();
  }

  getPayees(page: number = 1) {
    this.payeeService.performSearch(page);
    this.payees$ = this.payeeService.payees$;
    this.cdr.detectChanges();
  }

  getActiveBalance(
    merchantId: string,
    bankAccountId: number,
    bankName: string
  ) {
    this.transferService
      .getActiveBalance(merchantId, bankAccountId, bankName)
      .subscribe(resp => {
        if (resp) {
          this.activeBalance = resp.result.effectiveBalance;
          console.log(this.activeBalance);
        }
      });
  }

  verifyVPA() {
    this._verifyingVPA$.next(true);
    const vpa = this.vpa;
    if (/^[\w.-]+@[\w.-]+$/.test(vpa) === false) {
      this.vpaHolderNameError = 'Please enter a valid VPA';
      this.cdr.detectChanges();
      return;
    }
    this.spinner.show();
    this.vpaService
      .verifyVPA(
        vpa,
        this.connectedBanking
          ? this.selectedBankAccount.bankAccountNo
          : this.selectedAccount.hardEscrowAccountNumber,
        this.isAdmin,
        this.selectedBank.toLowerCase()
      )
      .subscribe(
        resp => {
          this._verifyingVPA$.next(false);
          if ((resp as any).result && (resp as any).result.name)
            this.vpaHolderName = (resp as any).result.name;
          else this.vpaHolderNameError = "Couldn't validate UPI ID";
          this.spinner.hide();
          this.cdr.detectChanges();
        },
        err => {
          console.log(err);
          this._verifyingVPA$.next(false);
          this.vpaHolderNameError = "Couldn't validate UPI ID";
          this.spinner.hide();
          this.cdr.detectChanges();
        }
      );
  }

  getBankAccounts(merchantId: string, bank: string = '') {
    this.transferService
      .getBankAccounts(merchantId, bank, '', true)
      .subscribe((resp: any) => {
        if (resp.success) {
          this.bankAccounts = resp.result.filter(
            (accounts: any) => accounts.enableConnectedBankingWithVA === false
          );
          console.log(this.bankAccounts);
        }
        this.cdr.detectChanges();
      });
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    for (const name in controls) {
      if (name === 'vpa' && controls[name].invalid) {
        this.errors.push('Please enter a valid UPI Id');
      } else if (controls[name].invalid) {
        this.errors.push('Please enter a valid ' + name);
      }
    }
  }

  downloadFile($event: Event, docHash: string, docName?: string) {
    this.utilityService.downloadFile(
      $event,
      docHash,
      this.downloadFolderName,
      docName
    );
  }

  private _loading$ = new BehaviorSubject(false);

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  // form controls getters
  get account() {
    return this.transferForm.get('account');
  }

  get amount() {
    return this.transferForm.get('amount');
  }

  docUp() {
    const element: HTMLElement = document.getElementById(
      'uploadDocs'
    ) as HTMLElement;
    element.click();
  }
  /**
   * A simple checkbox toggle
   * to make the upload documents views are displayed.
   * @param checkbox
   */
  async checkboxSupportingDocuments(checkbox: HTMLInputElement) {
    if (checkbox.checked) {
      this.addSupportingDocuments = true;
      this.cdr.detectChanges();
    } else {
      this.addSupportingDocuments = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * A function to upload the given file.
   * It will save the documents id in local storage.
   * @param $event
   */
  onfileChange($event: any) {
    $event.preventDefault();
    this.uploading = true;
    for (let file of $event.target.files) {
      if (!this.fileExtentionRegex.test(file.name)) {
        this.showToast('Error', `File format not allowed.`, {
          headerClasses: 'bg-danger text-white'
        });
        this.uploading = false;
        continue;
      }
      const formdata = new FormData();
      formdata.append('file', file);
      this.transferDocumentService.uploadDocument(formdata).subscribe(
        (resp: any) => {
          const result = resp.result as TransferDocumentDetail;
          localStorage.setItem('account_bool', 'false');
          this.uploading = false;
          if (resp.success) {
            this.uploadedDocuments.push({
              ...result
            });
          }
          this.cdr.detectChanges();
        },
        err => {
          this.uploading = false;
          this.errors = err.error.errors;
          this.cdr.detectChanges();
        }
      );
      this.cdr.detectChanges();
    }
    if (this.myInputVariable) {
      this.myInputVariable.nativeElement.value = null;
    }
  }

  /**
   * A function to remove the given document.
   * @param docId string
   */
  deleteDoc(docId: string) {
    this.transferDocumentService.deleteDocument(docId).subscribe(
      (resp: any) => {
        // localStorage.setItem('account_bool', 'true');
        // console.log('ACCOUNT BOOL SET TO FALSE');
        if (resp.success) {
          this.uploadedDocuments = this.uploadedDocuments.filter(
            doc => doc.documentId !== docId
          );
          this.cdr.detectChanges();
        } else {
          /**
           * show toast here
           */
          console.log('error while deleting...');
        }
      },
      err => {
        this.errors = err.error.errors;
        this.cdr.detectChanges();
      }
    );
  }

  /**
   * returns: Transfer Form notes control.
   */
  get notes() {
    return this.transferForm.controls['notes'] as FormArray;
  }

  validateAmount(_val: string) {
    const val = Number.parseInt(_val ?? 0);

    this.transferForm.controls.amount.setErrors({});
    this.cdr.detectChanges();

    // @TODO: add validation for UPI here
    if (this.transferForm.value.transferTo === 'vpa' && val > 100000) {
      this.transferForm.controls.amount.setErrors({
        upi: true
      });
    }

    this.cdr.detectChanges();
  }

  tcCheckboxAction(checkbox: HTMLInputElement) {
    this.isTCAccepted = checkbox.checked;
    this.cdr.detectChanges();
  }

  // @HostListener('keydown', ['$event'])
  amountChanged(event: any) {
    this.selectedAmount = event.target.value;
    this.transferForm.controls.amount.setValue(event.target.value);
    return this.utilityService.onlyNumeric(event);
  }

  checkFormValue(data: any): boolean {
    for (let key in data) {
      if (data[key] !== null && data[key] !== '' && data[key] !== undefined) {
        return true;
      }
    }
    return false;
  }

  updateMerchant(event: any) {
    // set form controls
    this.transferForm.controls.merchant.setValue(
      this.selectedMerchant?.merchantId
    );
    // set payees array
    // merge payee details with each payee
    // get accounts
    this.accountService.merchantId = this.selectedMerchant?.merchantId || '';
    this.accountService.performSearch(
      accountsStatus.ACTIVE,
      this.transferForm.value.transferTo
    );
    this.accountService.account$.subscribe(e => {
      this.accounts = e;
    });
    this.selectedAccount = null;
    this.cdr.detectChanges();
  }

  // fetch account on each key hit
  fetchAccount($event: any) {
    this.accountService.searchTerm = $event.term;
    this.accountService.performSearch(accountsStatus.ACTIVE, '', 'rbl');
    this.accountService.account$.subscribe(resp => {
      this.accounts = resp;
      this.cdr.detectChanges();
    });
  }

  // when a account is selected
  updateAccount(event: any) {
    this.cdr.detectChanges();
    // set form controls
    this.isRetention = !!event.retentionAmount;
    this.transferForm.controls.vpa.reset();
    this.vpaHolderName = '';
    this.transferForm.controls.account.setValue(event);
    this.selectedAccount = event;
    this.accountPayeeService.getLinkedPayee(
      event.accountId,
      this.merchantId,
      'vpa'
    );

    this.cdr.detectChanges();
  }

  // Once the OTP is verified
  // Create the form data

  // validate and send OTP
  sendOTP() {
    let transferType = this.transferForm.value.transferType;

    if (
      this.transferForm.value.transferTo === 'vpa' &&
      this.transferForm.value.amount > 100000
    ) {
      return;
    }

    if (
      this.addSupportingDocuments &&
      (!this.uploadedDocuments || this.uploadedDocuments?.length <= 0)
    ) {
      this.showToast('Error', 'Please Upload Supporting Documents.', {
        headerClasses: 'bg-danger text-white'
      });
      return;
    }

    this.errors = [];

    if (!this.connectedBanking && !this.selectedAccount) {
      this.errors = [];
      this.errors.push('Please select an Digital Escrow.');
      return;
    }

    if (this.connectedBanking && !this.selectedBankAccount) {
      this.errors = [];
      this.errors.push('Please select an account.');
      return;
    }

    if (!this.vpaHolderName) {
      this.errors = [];
      this.errors.push('Please verify the UPI ID.');
      return;
    }

    if (this.selectedAmount < 1) {
      this.errors.push('Minimum transferable amount is ₹1.');
      return;
    }

    if (this.selectedAmount > this.selectedAccount?.balance) {
      this.errors.push(`Amount cannot exceed account's balance.`);
      return;
    }

    if (!this.isTCAccepted) {
      this.errors.push('Please agree to the Terms and Conditions.');
      return;
    }

    this.transferForm.controls.amount.setValue(this.selectedAmount);

    // open OTP verification modal
    const modalRef: NgbModalRef & {
      componentInstance: OtpModalComponent;
    } = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.doClose = modalRef;
    modalRef.componentInstance.templateId = smsMsg91TemplateId.transferOtp;
    this._loading$.next(true);
    modalRef.componentInstance.passOtp.subscribe(
      (otp: number) => {
        this._loading$.next(false);
        if (otp) {
          this.transferForm.patchValue({
            otp: otp.toString()
          });
          this.onSubmit();
        } else {
          console.log('something went with modal');
        }
      },
      // tslint:disable-next-line:no-any
      (err: any) => {
        this._loading$.next(false);
        if (err.status === 0) {
          this.errors = ['Connection Error'];
        }
        this.cdr.detectChanges();
        // this.errors = [err.message];
      }
    );

    modalRef.result.then(
      data => {
        // on close
        this._loading$.next(false);
      },
      reason => {
        // on dismiss
        this._loading$.next(false);
      }
    );
    // } else {
    //   this.onSubmit();
    // }
  }

  removeOldErrors() {
    this.errors = [];
    this.cdr.detectChanges();
  }

  //showTOast
  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 15000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }

  // submit the form data
  onSubmit() {
    this.spinner.show();
    this.removeOldErrors();
    this.submitted = true;
    this.cdr.detectChanges();
    const param = {} as Transfer;
    if (this.connectedBanking)
      param.bankAccountNumber = this.transferForm.get(
        'bankAccount'
      )?.value.bankAccountNo;
    if (!this.connectedBanking)
      param.accountId = this.transferForm.get('account')?.value.accountId;
    param.payeeId = this.selectedPayee.payeeId;
    param.amount = Number(this.transferForm.get('amount')?.value);
    param.upiId = this.vpa;
    param.beneficiaryName = this.vpaHolderName;
    param.purpose = this.transferForm.get('purpose')?.value;
    if (this.addSupportingDocuments) {
      param.documentIds = [];
      this.uploadedDocuments.forEach(it => {
        param.documentIds?.push(it.documentId);
      });
    }

    param.otp = this.transferForm.get('otp')?.value;

    this._loading$.next(true);
    this.transferService
      .createUPITransferEntry(this.connectedBanking, param)
      .subscribe(
        resp => {
          this._loading$.next(false);
          if (resp.success) {
            this.connectedBanking
              ? this.router
                .navigate([
                  environment.urlPortalPrefix + '/passbook/bank-accounts'
                ])
                .then(r => r)
              : this.router
                .navigate([environment.urlPortalPrefix + '/passbook'])
                .then(r => r);

            this.showToast('Success', 'Transfer Created Successfully', {
              headerClasses: 'bg-success text-white'
            });
            this.spinner.hide();
          } else {
            this.errors = resp.errors;
            this.submitted = false;

            this.createTransferError = this.errors[0];
            this.showToast('Error', resp.errors[0], {
              headerClasses: 'bg-danger text-white'
            });

            this.cdr.detectChanges();
            this.spinner.hide();
          }
        },
        err => {
          this._loading$.next(false);
          if (err.status === 0) {
            this.errors = ['Connection Error'];
          }

          const errorMessage =
            err.error?.errors && err.error?.errors.length > 0
              ? err.error?.errors[0]
              : 'Something went wrong';
          this.createTransferError = errorMessage;
          this.showToast('Error', errorMessage, {
            headerClasses: 'bg-danger text-white'
          });

          this.cdr.detectChanges();
          this.spinner.hide();
        }
      );
  }

  updatePayee(event: any) {
    console.log(event);
    if (!event) {
      this.vpaHolderName = '';
    }
    this.vpa = event.vpa;
    this.cdr.detectChanges();
  }

  assignBanks() {
    if (this.profile) {
      this.profile.banks.forEach((bank: any) => {
        let bankName =
          bank.bankName === banksTypes.YES_BANK
            ? bank.bankName.split('_')[0]
            : bank.bankName;
        if (this.profile && this.profile[bankName + 'Banks']?.length > 0) {
          let account = this.profile[bankName + 'Banks'].filter(
            (account: any) => {
              if (this.connectedBanking) {
                return account?.enableConnectedBanking === true;
              } else {
                return (
                  !account?.enableConnectedBanking ||
                  account?.enableConnectedBanking === false ||
                  (account?.enableConnectedBanking &&
                    account.enableConnectedBankingWithVA)
                );
              }
            }
          );
          if (account?.length > 0) {
            if (banksAllowedUPI.includes(bankName)) {
              this.banks.push(bankName.toUpperCase());
            }
          }
        }
      });
    }
    // this.cdr.detectChanges();
  }
}

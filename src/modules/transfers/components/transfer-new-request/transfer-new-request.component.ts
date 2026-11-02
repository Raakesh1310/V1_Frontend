import { utf8Encode } from '@angular/compiler/src/util';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OtpModalComponent } from '@common/components';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService, UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import accountsStatus from '@modules/accounts/constants/accountsStatus';
import banksTypes from '@modules/accounts/constants/banksTypes';
import { Account } from '@modules/accounts/models';
import {
  AccountPayeeService,
  AccountsService
} from '@modules/accounts/services';
import { Merchant } from '@modules/auth/models/merchant.model';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { AuthService } from '@modules/auth/services';
import { ProfileResponseModel } from '@modules/profile/models';
import { HDFCBankMerchantProfile } from '@modules/profile/models/hdfcAccounts';
import { RBLBankMerchantProfile } from '@modules/profile/models/rblAccount';
import { YesBankMerchantProfile } from '@modules/profile/models/yesAccount';
import { ProfileService } from '@modules/profile/services';
import banksAllowedIMPS from '@modules/transfers/constants/banksAllowedIMPS';
import banksAllowedUPI from '@modules/transfers/constants/banksAllowedUPI';
import { alphaNumericRegex } from '@modules/transfers/constants/notesKeyInputRegEx';
import {
  AuthModel,
  AuthTransferStruct,
  Transfer,
  TransferDocumentDetail
} from '@modules/transfers/models';
import { TransfersService } from '@modules/transfers/services';
import { TransferDocumentService } from '@modules/transfers/services/transfer-document.service';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Observable } from 'rxjs';
import smsMsg91TemplateId from '../../../../config/smsMsg91TemplateId';
import { environment } from '../../../../environments/environment';
import { PayeeService } from '@modules/payee/services';
import { Payee } from '@modules/payee/models';
import bankTypeArrayConstant from '@common/constants/bankTypeArray.constant';
import payeeAccountType from 'config/payeeAccountType';

@Component({
  selector: 'sbpro-transfer-new-request',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transfer-new-request.component.pug',
  styleUrls: ['transfer-new-request.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransferNewRequestComponent implements OnInit {
  // form data holder
  docUrlPrefix = environment.apiHost + '/uploads/transfers/single-transfers/';
  transferForm!: FormGroup;
  transferTypes = [
    { id: 1, transferType: 'IMPS' },
    { id: 1, transferType: 'NEFT' },
    { id: 1, transferType: 'RTGS' }
  ];
  @Input() connectedBanking!: boolean;
  accounts!: Account[];
  payees: any = [];
  purpose = '';
  minDate1!: NgbDateStruct;
  frequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly'];
  selectedFrequency = '';
  repeat: number | null = null;
  startDate: NgbDateStruct;
  isGAuthEnabled = false;
  // data togglers
  selectedAccount: any = null;
  selectedBankAccount: any = null;
  selectedPayee: any = null;
  selectedAmount: any = null;
  selectedTransferType: any = 'NEFT';
  submitted = false;
  isRecurring = false;
  isTCAccepted = false;
  isFTAllowed = false;
  // error handler
  errors!: string[];
  // data observable
  accounts$!: Observable<Account[]>;
  public isAdmin = false;
  merchants: Merchant[] = [];
  selectedMerchant: Merchant | undefined;

  dropdownListMerchantAuthorizers: AuthModel[] = [];
  selectedMerchantAuthorizers: AuthModel[] = [];

  dropdownListAccountAuthorizers: AuthModel[] = [];
  selectedAccountAuthorizers: AuthModel[] = [];

  showMerchantAuthorizer = false;
  showAccountAuthorizer = false;
  isIMPS = false;
  merchantIMPS = false;

  createTransferError = '';
  multiBanks: string[] = [];
  dropdownSettings = {};
  addSupportingDocuments = false;
  transferId: string = '';
  uploading = false;
  @ViewChild('myInput')
  myInputVariable: ElementRef | null = null;

  maxNotesAllowed = environment.maxNumberOfNotes ?? 15;

  formatsAllowed = '.png,.jpg,.pdf,.xlsx,.xls,.csv,.doc,.docx';

  fileExtentionRegex = new RegExp(
    `^.*(${this.formatsAllowed.split(',').join('|')})$`
  );
  uploadedDocuments: TransferDocumentDetail[] = [];

  profile!: any;
  downloadFolderName = S3FolderName.SINGLE_TRANSFERS;
  public banks: string[] = [];

  payees$!: Observable<Payee[]>;
  bankAccounts: any;
  // connectedBanking = false;
  pendingBalance!: number;
  activeBalance!: number;
  selectedBank!: string;
  merchantId!: string;
  isRetention!: boolean;

  private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
  private _loadingList$ = new BehaviorSubject(false);
  private _lastTransferToOption = 'bankAccount';
  private _lastBankAccount = '';
  private _lastMerchant = '';
  private upiPayoutEnabled!: boolean;

  // constructor
  constructor(
    private formBuilder: FormBuilder,
    private transferService: TransfersService,
    private transferDocumentService: TransferDocumentService,
    private router: Router,
    private accountService: AccountsService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private calendar: NgbCalendar,
    private utilService: UtilityService,
    private dateParser: NgbDateParserService,
    private accountPayeeService: AccountPayeeService,
    private payeeService: PayeeService,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private profileService: ProfileService,
    private utilityService: UtilityService,
    private toastService: ToastService
  ) {
    this.errors = [];
    const currDate = new Date();
    this.minDate1 = calendar.getNext(
      new NgbDate(
        currDate.getFullYear(),
        currDate.getMonth() + 1,
        currDate.getDate()
      ),
      'd',
      0
    );
    this.startDate = this.minDate1;

    this.isAdmin = this.authService.isSuperAdmin();
    this.profile = this.authService.getMerchantProfile();
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

    this.dropdownListMerchantAuthorizers = [];
    this.dropdownListAccountAuthorizers = [];
    this.selectedMerchantAuthorizers = [];
    this.selectedAccountAuthorizers = [];

    this.dropdownSettings = {
      singleSelection: false,
      text: 'Authorizer(s)',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: 'myclass custom-class'
    };

    // initialize form
    this.transferForm = this.formBuilder.group({
      merchant: [this.selectedMerchant, Validators.required],
      bank: [this.selectedBank, Validators.required],
      //bankAccount OR vpa
      transferTo: ['bankAccount', Validators.required],
      account: [this.selectedAccount],
      bankAccount: [this.selectedAccount],
      amount: ['', [Validators.required, Validators.min(1)]],
      otp: ['', [Validators.required]],
      payee: ['', [Validators.required]],
      transferType: ['NEFT'],
      purpose: ['', [Validators.pattern(/^[a-zA-Z0-9 ]*$/)]],
      tcCheckBox: [
        false,
        this.isAdmin ? Validators.nullValidator : Validators.requiredTrue
      ],
      notes: this.formBuilder.array([])
    });

    this.transferForm.valueChanges.subscribe(data => {
      if (!data.payee) {
        this.isFTAllowed = false;
      }

      // * match the first 4 digits of IFSC to check if FT transfer type can be allowed
      if (data.account && data.payee) {
        this.isFTAllowed =
          data.account.ifsc.substring(0, 4) === data.payee.ifsc.substring(0, 4);
        if (this.isFTAllowed) {
          this.transferForm.value.transferType = 'FT';
          this.cdr.detectChanges();
        }
      }

      this.cdr.detectChanges();
    });

    if (this.isAdmin) {
      this.getMerchants('');
    }

    this.transferForm.valueChanges.subscribe(data => {
      // remove the upi error if the option is changed to bankAccount
      if (data.transferTo === 'bankAccount') {
        this.transferForm.controls.amount.setErrors({
          upi: false
        });
      }

      if (
        data.transferTo !== this._lastTransferToOption ||
        data.merchant !== this._lastMerchant
      ) {
        this.profileService.getProfile(data.merchant).subscribe(resp => {
          const bankHasUPIAccess = !!_.filter(resp.result.banks, bank =>
            banksAllowedUPI.includes(bank.bankName)
          ).length;

          this.upiPayoutEnabled =
            bankHasUPIAccess && resp.result.upiPayoutEnabled;

          this.connectedBanking = this.connectedBanking;
          if (this.connectedBanking) {
            this.merchantId = resp.result.merchantId;
          }
          this.cdr.detectChanges();
        });
        if (!this.connectedBanking) {
          this.accountService.performSearch(
            accountsStatus.ACTIVE,
            data.transferTo
          );
        }
      }

      this.validateAmount(data.amount);
      if (data.account === null || data.transferTo === '') return;

      if (data.account.accountId !== this._lastBankAccount)
        this.accountPayeeService.getLinkedPayee(
          data.account.accountId,
          this.accountService.merchantId,
          data.transferTo
        );

      //set both options
      this._lastMerchant = data.merchant;
      this._lastBankAccount = data.account.accountId;
      this._lastTransferToOption = data.transferTo;
    });
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

  /**
   * Add note field to the notes field form array.
   */
  addNote() {
    if (this.notes.length < this.maxNotesAllowed) {
      const noteForm = this.formBuilder.group({
        key: ['', Validators.required],
        value: ['', Validators.required]
      });
      this.notes.push(noteForm);
      // const val = this.getNote(this.notes.length - 1);
      this.cdr.detectChanges();
    } else {
      this.showToast(
        'Error',
        `Maximum ${this.maxNotesAllowed} key-values allowed`,
        {
          headerClasses: 'bg-danger text-white'
        }
      );
    }
  }

  /**
   *
   * @param noteIndex Index of the note to access
   * Delete that particular note.
   */
  deleteNote(noteIndex: number) {
    this.notes.removeAt(noteIndex);
    this.cdr.detectChanges();
  }

  /**
   *
   * @param noteIndex Index of the note to access
   * @returns Note FormGroup at that position
   */
  getNote(noteIndex: number) {
    return this.notes.at(noteIndex) as FormGroup;
  }

  /**
   *
   * @param noteIndex Index of the note to access
   * @returns key of that particular note at the given index
   */
  getNoteKey(noteIndex: number) {
    return this.getNote(noteIndex).controls['key'];
  }

  /**
   *
   * @param noteIndex Index of the note to access
   * @returns value of that particular note at the given index
   */
  getNoteValue(noteIndex: number) {
    return this.getNote(noteIndex).controls['value'];
  }

  /**
   *
   * @param noteIndex Index of the note to access
   * @returns Check if the key has an error.
   */
  getNoteKeyErrors(noteIndex: number): string[] {
    const noteKey = this.getNoteKey(noteIndex);
    const errors = [];
    const allNotesKeys = _.map(this.notes.value, 'key');
    const duplicates = _(allNotesKeys)
      .groupBy()
      .pickBy(x => x.length > 1)
      .keys()
      .value();

    if (noteKey.errors?.required) {
      errors.push(`Note Key Index ${noteIndex} is empty`);
    } else if (duplicates?.length) {
      errors.push(`Note Key Index ${noteIndex} is duplicate`);
    } else if (!alphaNumericRegex.test(noteKey.value)) {
      errors.push(`Note Key Index ${noteIndex} contains special characters.`);
    }
    return errors;
  }

  /**
   *
   * @param noteIndex Index of the note to access
   * @returns Check if the value has an error.
   */
  getNoteValueErrors(noteIndex: number): string[] {
    const errors = [];
    const valueKey = this.getNoteValue(noteIndex);

    if (valueKey.errors?.required) {
      errors.push(`Note Key Index ${noteIndex} is empty`);
    }
    return errors;
  }

  /**
   *
   * @returns All the key value error of all the notes
   */
  getNotesErrorShowToasts(): {
    keyError: string[];
    valueError: string[];
  }[] {
    const errors: {
      keyError: string[];
      valueError: string[];
    }[] = [];
    for (let index = 0; index < this.notes.value.length; index++) {
      const key = this.getNoteKeyErrors(index);
      const value = this.getNoteValueErrors(index);
      if (key || value) {
        const error = {
          keyError: this.getNoteKeyErrors(index),
          valueError: this.getNoteValueErrors(index)
        };
        if (error.keyError?.length) {
          this.showToast('Error', error.keyError.join('\n'), {
            headerClasses: 'bg-danger text-white'
          });
        }
        if (error.valueError?.length) {
          this.showToast('Error', error.valueError.join('\n'), {
            headerClasses: 'bg-danger text-white'
          });
        }
        errors.push(error);
      }
    }
    return errors;
  }

  validateAmount(_val: string) {
    const val = Number.parseInt(_val ?? 0);

    const transferType = this.transferForm.value.transferType;

    this.transferForm.controls.amount.setErrors({});
    this.cdr.detectChanges();

    if (transferType === 'RTGS') {
      if (val < 200000) {
        this.transferForm.controls.amount.setErrors({
          rtgs: true,
          imps: false
        });
      }
    }

    if (transferType === 'IMPS') {
      if (val > 500000) {
        this.transferForm.controls.amount.setErrors({
          imps: true,
          rtgs: false
        });
      }
    }

    // @TODO: add validation for UPI here
    if (this.transferForm.value.transferTo === 'vpa' && val > 100000) {
      this.transferForm.controls.amount.setErrors({
        upi: true
      });
    }

    this.cdr.detectChanges();
  }

  onlyTenNumbers(e: any) {
    try {
      let validation = e.key.toLowerCase().match(/^[0-9]+$/);

      let phoneNumber =
        (this.repeat as number)?.toString().length + (validation ? 1 : 0);
      let val = phoneNumber > 4;
      if (
        (!val && validation) ||
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowLeft'
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  checkboxAction(checkbox: Event) {
    this.isRecurring = (checkbox.target as HTMLInputElement).checked;
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

  // @HostListener('keydown', ['$event'])
  repeatChanged(event: any) {
    this.selectedAmount = event.target.value;
    // this.transferForm.controls.amount.setValue(event.target.value);
    return this.utilityService.onlyNumericWithoutDecimal(event.target.value);
  }

  checkFormValue(data: any): boolean {
    for (let key in data) {
      if (data[key] !== null && data[key] !== '' && data[key] !== undefined) {
        return true;
      }
    }
    return false;
  }
  // getBalance(merchantId: string) {
  //   this.transferService.getBalance(merchantId).subscribe((resp: any) => {
  //     this.pendingBalance = resp.result.pendingBalance;
  //     console.log(this.pendingBalance);
  //   });
  // }
  getBankAccounts(merchantId: string, bank: string = '') {
    this.selectedBankAccount = null;
    this.bankAccounts = [];
    this.transferService
      .getBankAccounts(merchantId, bank)
      .subscribe((resp: any) => {
        this.bankAccounts = resp.result;
        // this.bankAccounts = resp.result.filter(
        //   (accounts: any) => accounts.enableConnectedBankingWithVA === false
        // );
        console.log(this.bankAccounts);
        this.cdr.detectChanges();
      });
  }

  getPayees(page: number = 1) {
    this.payeeService.type = payeeAccountType.bankAccount;
    this.payeeService.performSearch(page);
    this.payees$ = this.payeeService.payees$;
    this.cdr.detectChanges();
  }

  getMerchants(term: string) {
    this.accountService.getMerchants(term);

    this.accountService.merchant$.subscribe(resp => {
      this.merchants = resp;
      this.cdr.detectChanges();
    });
  }

  updateMerchant(event: any) {
    // set form controls
    this.transferForm.controls.merchant.setValue(
      this.selectedMerchant?.merchantId
    );
    if (!this.connectedBanking) {
      this.accountService.merchantId = this.selectedMerchant?.merchantId || '';
      this.accountService.performSearch(
        accountsStatus.ACTIVE,
        this.transferForm.value.transferTo,
        this.selectedBank
      );
      this.accountService.account$.subscribe(e => {
        this.accounts = e;
      });
    }

    if (this.connectedBanking) {
      this.getBankAccounts(this.merchantId, this.selectedBank);
    }

    this.selectedTransferType = null;
    this.selectedAccount = null;
    this.selectedPayee = null;
    this.cdr.detectChanges();
  }

  // fetch account on each key hit
  fetchAccount($event: any) {
    if (!this.connectedBanking) {
      this.accountService.searchTerm = $event.term;
      this.accountService.performSearch(accountsStatus.ACTIVE);
      this.accountService.account$.subscribe(resp => {
        this.accounts = resp;
        this.cdr.detectChanges();
      });
    }
  }

  filterTransferType($event: any) {
    return this.transferTypes.filter(Ttype => {
      var regExPattern = '.*' + $event.term.split('').join('.*') + '.*';
      const re = new RegExp(regExPattern);
      return re.test(Ttype.transferType);
    });
  }

  updatePayee(event: any) {
    if (this.isFTAllowed) {
      this.selectedTransferType = 'FT';
      this.transferForm.value.transferType = 'FT';
    } else {
      this.selectedTransferType = 'NEFT';
      this.transferForm.value.transferType = 'NEFT';
    }

    this.cdr.detectChanges();
  }

  // when a account is selected
  updateAccount(event: any) {
    this.isIMPS = false;
    this.isFTAllowed = false;
    this.isRetention = !!event.retentionAmount;
    this.cdr.detectChanges();
    // set form controls
    this.transferForm.controls.account.setValue(event.accountId);
    this.selectedAccount = event;
    // set payees array
    // merge payee details with each payee
    this.selectedPayee = null;
    this.payees = [];

    //Check if YES Bank then Profile needs to be fetched
    if (
      this.selectedAccount.bank === banksTypes.YES_BANK ||
      this.selectedAccount.bank === banksTypes.HDFC ||
      this.selectedAccount.bank === banksTypes.IBL ||
      this.selectedAccount.bank === banksTypes.RBL ||
      this.selectedAccount.bank === banksTypes.IDFC ||
      this.selectedAccount.bank === banksTypes.DBS ||
      this.selectedAccount.bank === banksTypes.AXIS
    ) {
      let bankProperty = '';

      switch (this.selectedAccount.bank) {
        case banksTypes.HDFC:
          bankProperty = 'hdfcBanks';
          break;

        case banksTypes.YES_BANK:
          bankProperty = 'yesBanks';
          break;

        case banksTypes.IBL:
          bankProperty = 'iblBanks';
          break;

        case banksTypes.RBL:
          bankProperty = 'rblBanks';
          break;

        case banksTypes.IDFC:
          bankProperty = 'idfcBanks';
          break;

        case banksTypes.DBS:
          bankProperty = 'dbsBanks';
          break;

        case banksTypes.AXIS:
          bankProperty = 'axisBanks';
          break;
      }

      //Check if icici Bank then Profile needs to be fetched

      if (banksAllowedIMPS[this.selectedAccount.bank]) {
        this.profileService
          .getProfile(
            this.isAdmin ? this.selectedMerchant!.merchantId : null,
            false
          )
          .subscribe((resp: ProfileResponseModel) => {
            resp.result[`${bankProperty}`].forEach(
              (
                element:
                  | YesBankMerchantProfile
                  | HDFCBankMerchantProfile
                  | RBLBankMerchantProfile
              ) => {
                if (
                  element.accountNo ==
                  this.selectedAccount.hardEscrowAccountNumber
                ) {
                  if (
                    this.selectedAccount.bank === banksTypes.RBL &&
                    element.paymentMode === 'h2h'
                  ) {
                    this.merchantIMPS = false;
                    this.isIMPS = false;
                  } else {
                    this.merchantIMPS = element.isIMPS ? element.isIMPS : false;
                    this.isIMPS = element.isIMPS ? element.isIMPS : false;
                  }
                }
              }
            );
          });
      }

      this.cdr.detectChanges();
    }

    this.cdr.detectChanges();
  }

  updateBankAccount(event: any) {
    this.isIMPS = false;
    this.isFTAllowed = false;
    this.selectedBankAccount = event;
    this.getActiveBalance(
      this.selectedBankAccount.merchantId,
      this.selectedBankAccount.bankAccountNo,
      this.selectedBankAccount.bankName
    );
    this.getPayees(-1);
    if (
      this.selectedBankAccount.bankName === banksTypes.YES_BANK ||
      this.selectedBankAccount.bankName === banksTypes.HDFC ||
      this.selectedBankAccount.bankName === banksTypes.IBL ||
      this.selectedBankAccount.bankName === banksTypes.RBL ||
      this.selectedBankAccount.bankName === banksTypes.IDFC ||
      this.selectedBankAccount.bankName === banksTypes.DBS ||
      this.selectedBankAccount.bankName === banksTypes.AXIS
    ) {
      let bankProperty = '';

      switch (this.selectedBankAccount.bankName) {
        case banksTypes.HDFC:
          bankProperty = 'hdfcBanks';
          break;

        case banksTypes.YES_BANK:
          bankProperty = 'yesBanks';
          break;

        case banksTypes.IBL:
          bankProperty = 'iblBanks';
          break;

        case banksTypes.RBL:
          bankProperty = 'rblBanks';
          break;

        case banksTypes.IDFC:
          bankProperty = 'idfcBanks';
          break;

        case banksTypes.DBS:
          bankProperty = 'dbsBanks';
          break;

        case banksTypes.AXIS:
          bankProperty = 'axisBanks';
          break;
      }

      //Check if icici Bank then Profile needs to be fetched

      if (banksAllowedIMPS[this.selectedBankAccount.bankName]) {
        this.profileService
          .getProfile(
            this.isAdmin ? this.selectedMerchant!.merchantId : null,
            false
          )
          .subscribe((resp: ProfileResponseModel) => {
            resp.result[`${bankProperty}`].forEach(
              (
                element:
                  | YesBankMerchantProfile
                  | HDFCBankMerchantProfile
                  | RBLBankMerchantProfile
              ) => {
                if (
                  element.accountNo == this.selectedBankAccount.bankAccountNo
                ) {
                  if (
                    this.selectedBankAccount.bankName === banksTypes.RBL &&
                    element.paymentMode === 'h2h'
                  ) {
                    this.merchantIMPS = false;
                    this.isIMPS = false;
                  } else {
                    this.merchantIMPS = element.isIMPS ? element.isIMPS : false;
                    this.isIMPS = element.isIMPS ? element.isIMPS : false;
                  }
                }
              }
            );
          });
      }

      this.cdr.detectChanges();
    }
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
      this.connectedBanking &&
      this.transferForm.value.amount > this.activeBalance
    ) {
      this.errors.push('Available balance is less than total transfer amount');
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

    if (
      (this.selectedMerchantAuthorizers.length === 0 &&
        this.showMerchantAuthorizer) ||
      (this.selectedAccountAuthorizers.length === 0 &&
        this.showAccountAuthorizer)
    ) {
      this.errors = [];
      this.errors.push('Please select at least 1 Authorizers');
      return;
    }
    // validate account
    if (!this.selectedAccount && !this.selectedBankAccount) {
      this.errors = [];
      this.errors.push('Please select an Digital Escrow.');
      return;
    }

    // validate payee
    if (!this.selectedPayee) {
      this.errors = [];
      this.errors.push('Please select a Payee.');
      return;
    }

    if (this.selectedAmount < 1) {
      this.errors.push('Minimum transferable amount is ₹1.');
      return;
    }

    if (transferType === 'RTGS' && this.selectedAmount < 200_000) {
      this.errors.push(
        'RTGS amount should be Greater than or Equal to Rs 2 Lacs'
      );

      return;
    }

    if (transferType === 'IMPS' && this.selectedAmount > 500_000) {
      this.errors.push('IMPS amount should be Less than or Equal to Rs 5 Lacs');
      return;
    }

    if (this.selectedAmount > this.selectedAccount?.balance) {
      this.errors.push(`Amount cannot exceed account's balance.`);
      return;
    }

    if (this.selectedAmount > this.selectedPayee?.balance && !this.isRetention) {
      this.errors.push(`Amount cannot exceed payee's maximum transfer limit.`);
      return;
    }

    if (this.isRecurring) {
      if (!this.selectedFrequency) {
        this.errors.push('Please select a frequency.');
        return;
      }

      if (!this.repeat) {
        this.errors.push('Please select a repeating period.');
        return;
      }

      if (this.repeat && this.repeat < 1) {
        this.errors.push('Please set a frequency greater than zero.');
        return;
      }
    }

    if (!this.isTCAccepted && !this.isAdmin) {
      this.errors.push('Please agree to the Terms and Conditions.');
      return;
    }

    this.transferForm.controls.amount.setValue(this.selectedAmount);

    const notesError = this.getNotesErrorShowToasts();
    if (
      !_.findIndex(notesError, note => {
        return note.keyError?.length > 0 || note.valueError?.length > 0;
      })
    ) {
      this.errors.push('Key Value Error');
      this.cdr.detectChanges();
      return;
    }

    if (
      !this.selectedBankAccount?.bankName &&
      this.selectedAccount.bank === banksTypes.ICICI
    ) {
      if (this.selectedAmount >= 200000) {
        this.transferForm.value.transferType = 'RTGS';
        this.transferForm.controls.transferType.setValue('RTGS');
      } else {
        this.transferForm.value.transferType = 'NEFT';
        this.transferForm.controls.transferType.setValue('NEFT');
      }
    }

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

  assignBanks() {
    this.profile.banks.forEach((bank: any) => {
      let bankName =
        bank.bankName === banksTypes.YES_BANK
          ? bank.bankName.split('_')[0]
          : bank.bankName;
      if (this.profile[bankName + 'Banks']?.length > 0) {
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
          this.banks.push(bankName.toUpperCase());
        }
      }
    });
    // this.cdr.detectChanges();
  }

  // submit the form data
  onSubmit() {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    let merchantAuthorizers: AuthTransferStruct[] = [];
    let accountAuthorizers: AuthTransferStruct[] = [];
    if (this.selectedMerchantAuthorizers.length > 0) {
      this.selectedMerchantAuthorizers.forEach(it => {
        merchantAuthorizers.push({
          name: it.data.name,
          email: it.data.email
        });
      });
    }
    if (this.selectedAccountAuthorizers.length > 0) {
      this.selectedAccountAuthorizers.forEach(it => {
        accountAuthorizers.push({
          name: it.data.name,
          email: it.data.email
        });
      });
    }

    this.spinner.show();
    this.removeOldErrors();
    this.submitted = true;
    this.cdr.detectChanges();
    const param = {} as Transfer;
    if (this.transferForm.get('account')?.value) {
      param.accountId = this.transferForm.get('account')?.value.accountId || '';
    }
    if (this.transferForm.get('bankAccount')?.value) {
      param.bankAccountNumber =
        this.transferForm.get('bankAccount')?.value.bankAccountNo.toString() ||
        '';
    }
    param.payeeId = this.selectedPayee.payeeId;
    param.amount = Number(this.transferForm.get('amount')?.value);
    param.purpose = this.transferForm.get('purpose')?.value;
    param.notes = _.reduce(
      <{ key: string; value: string }[]>this.notes.value,
      function(sum, n) {
        sum[`${n.key}`] = utf8Encode(n.value);
        return sum;
      },
      <Transfer['notes']>{}
    );

    if (this.addSupportingDocuments) {
      param.documentIds = [];
      this.uploadedDocuments.forEach(it => {
        param.documentIds?.push(it.documentId);
      });
    }

    if (this.isRecurring) {
      param.recurring = this.isRecurring;
      param.startDate = this.dateParser.format(this.startDate);
      param.remainingPayments = this.repeat || 1;
      param.frequency = this.selectedFrequency;
    }
    if (this.isAdmin && this.selectedMerchant?.merchantId) {
      param.merchantId = this.selectedMerchant?.merchantId;
    }
    param.otp = this.transferForm.get('otp')?.value;
    param.merchantAuthorizers = merchantAuthorizers;
    param.accountAuthorizers = accountAuthorizers;

    param.transferType = this.transferForm.value.transferType;

    this._loading$.next(true);
    this.transferService
      .addTransferEntry(param, this.isAdmin, this.transferForm.value.transferTo)
      .subscribe(
        resp => {
          this._loading$.next(false);
          if (resp.success) {
            if (this.isRecurring) {
              localStorage.setItem('Index', '2');
              this.router
                .navigate([
                  this.isAdmin
                    ? environment.urlAdminPrefix + '/transfer'
                    : environment.urlPortalPrefix + '/passbook'
                ])
                .then(r => r);
            } else {
              if (!this.connectedBanking) {
                this.router
                  .navigate([
                    this.isAdmin
                      ? environment.urlAdminPrefix + '/transfer'
                      : environment.urlPortalPrefix + '/passbook'
                  ])
                  .then(r => r);
              } else {
                this.router
                  .navigate([
                    this.isAdmin
                      ? environment.urlAdminPrefix + '/transfer'
                      : environment.urlPortalPrefix + '/passbook/bank-accounts'
                  ])
                  .then(r => r);
              }
            }

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
}

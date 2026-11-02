import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import {
  InputSourceAccount,
  SourceAccount
} from '@modules/accounts/models/source-account-validation.model';
import { AccountsService } from '@modules/accounts/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import accountStatus from 'config/accountStatus';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'sbpro-account-source-validation',
  templateUrl: './account-source-validation.component.pug',
  styleUrls: ['./account-source-validation.component.scss']
})
export class AccountSourceValidationComponent implements OnInit {
  sourceAccountForm!: FormGroup;
  formErrors: string[] = [];
  toastHead = '';
  toastBody = '';
  sourceAccounts!: SourceAccount[];
  enableSourceAccountCheckBox: boolean = true;
  modalRef: any;
  name!: string;
  ifsc!: string;
  bankAccountNumber!: string;
  bankName!: string;
  action!: string;
  modalBody!: string;
  enableSourceAccount!: boolean;
  isAdmin!: boolean;
  lastAccount: boolean = false;

  /**
   * inward bindings
   */
  @Input() selectedBank!: string;
  @Input() accountId = '';
  @Input() currentTab?: number;
  @Input() readOnly: boolean = false;
  /**
   * outward boundings
   */
  @Output() emitCurrentTab: EventEmitter<number> = new EventEmitter<number>();
  @Output() emitNextTab: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private modalService: NgbModal,
    private accountService: AccountsService,
    private spinner: NgxSpinnerService
  ) {
    this.sourceAccountForm = this.formBuilder.group({
      name: [
        null,
        [
          Validators.required,
          (val: FormControl) => {
            if (val.value === undefined) {
              return { Error: `Name is required` };
            }
            if (typeof val.value === 'string' && val.value.trim() === '') {
              return { Error: `Name is required` };
            }
            if (!RegExp('^[A-Za-z0-9- ]*$').test(val.value)) {
              return {
                Error: `Name should not contain any special Characters.`
              };
            }
          }
        ]
      ],
      bankAccountNumber: [
        null,
        [
          Validators.required,
          (val: FormControl) => {
            if (val.value === undefined) {
              return { Error: `Bank Account Number is required` };
            }
            if (typeof val.value === 'string' && val.value.trim() === '') {
              return { Error: `Bank Account Number is required` };
            }
            if (!RegExp('^[A-Za-z0-9- ]*$').test(val.value)) {
              return {
                Error: `Account Number should not contain special Characters.`
              };
            }
            if (/\s/.test(val.value)) {
              return {
                Error: `Account Number should not contain whitespace.`
              };
            }
          }
        ]
      ],
      ifsc: [
        null,
        [
          Validators.required,
          (val: FormControl) => {
            if (val.value === undefined) {
              return { Error: `IFSC is required` };
            }
            if (typeof val.value === 'string' && val.value.trim() === '') {
              return { Error: `IFSC is required` };
            }
            if (!RegExp('[A-Z|a-z]{4}[0][a-zA-Z0-9]{6}$').test(val.value)) {
              return { Error: `Ifsc is invalid.` };
            }
          }
        ]
      ],
      bankName: [
        null,
        [
          Validators.required,
          (val: FormControl) => {
            if (val.value === undefined) {
              return { Error: `Bank Name is required` };
            }
            if (typeof val.value === 'string' && val.value.trim() === '') {
              return { Error: `Bank Name is required` };
            }
            if (!RegExp('^[A-Za-z& ]*$').test(val.value)) {
              return {
                Error: `Bank Name should not contain Numbers or special Characters.`
              };
            }
          }
        ]
      ]
    });
  }

  ngOnInit(): void {
    this.spinner.show();
    // this.sourceAccountForm.enable();
    if (this.currentTab !== undefined) {
      this.currentTab = 2;
      this.emitCurrentTab.emit(this.currentTab);
      console.log(this.currentTab);
    }

    this.accountService.getSourceAccounts(this.accountId).subscribe(resp => {
      if (
        resp.result.sourceAccountValidation &&
        resp.result?.sourceAccounts?.length !== 0
      ) {
        console.log(resp);
        let inactiveAccounts = resp.result?.sourceAccounts?.filter(
          accounts => accounts.status === accountStatus.INACIVE
        );
        if (
          inactiveAccounts?.length === resp.result.sourceAccounts?.length &&
          resp.result.sourceAccountValidation
        ) {
          this.enableSourceAccountCheckBox = true;
          this.enableSourceAccount = false;
          this.accountService
            .updateSourceAccountValidation(
              this.accountId,
              this.enableSourceAccount
            )
            .subscribe();
        } else {
          this.enableSourceAccountCheckBox = resp.result.sourceAccountValidation
            ? false
            : true;
          this.enableSourceAccount = resp.result.sourceAccountValidation;
        }
      } else if (
        resp.result.sourceAccountValidation &&
        resp.result?.sourceAccounts?.length === 0
      ) {
        this.enableSourceAccountCheckBox = true;
        this.enableSourceAccount = false;
        this.accountService.updateSourceAccountValidation(
          this.accountId,
          this.enableSourceAccount
        ).subscribe();
      }
      this.sourceAccounts = resp.result.sourceAccounts;
      this.spinner.hide();
      this.cdr.detectChanges();
    });
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    console.log('CONTROLS ', controls);
    for (const name in controls) {
      const control = controls[name];

      if (control.invalid) {
        if (control.hasError('required')) {
          this.formErrors.push(`Please enter a valid ${name}`);
        } else if (control.hasError('Error')) {
          this.formErrors.push(control.getError('Error'));
        }
      }
    }
    this.toastBody = 'Please fill all the mandatory fields.';
    this.toastHead = 'Failed';
    this.showToast(this.toastHead, this.toastBody, {
      headerClasses: 'bg-danger text-white'
    });
    this.cdr.detectChanges();
  }

  onAdd() {
    console.log('SOURCE ACCOUNT FORM', this.sourceAccountForm);
    this.cdr.detectChanges();
    this.formErrors = [];
    if (!this.sourceAccountForm.valid) {
      this.findInvalidControls(this.sourceAccountForm);
      return;
    }

    let data: InputSourceAccount = {
      sourceAccount: {
        accountHolder: this.sourceAccountForm.controls.name.value,
        bankAccountNumber: this.sourceAccountForm.controls.bankAccountNumber
          .value,
        ifsc: this.sourceAccountForm.controls.ifsc.value,
        bankName: this.sourceAccountForm.controls.bankName.value,
        status: accountStatus.ACTIVE
      }
    };
    this.accountService.updateSourceAccount(this.accountId, data).subscribe(
      resp => {
        this.spinner.show();
        if (resp.result) {
          this.toastBody = 'Source Account Added Successfully.';
          this.toastHead = 'Success';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-success text-white'
          });
          this.ngOnInit();
          this.spinner.hide();
        } else {
          this.toastBody = 'Failed to Add Source account.';
          this.toastHead = 'Failed';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.ngOnInit();
          this.spinner.hide();
        }
        this.cdr.detectChanges();
      },
      error => {
        console.log(error);
        this.toastBody = error.error.errors;
        this.toastHead = 'Failed';
        this.showToast(this.toastHead, this.toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.ngOnInit();
        this.spinner.hide();
      }
    );
    this.sourceAccountForm.reset();
  }

  allowSourceAccountValidation(event: any, modal: HTMLElement) {
    console.log('allowSourceAccountValidation', event.target.checked);
    // this.enableSourceAccount = event.target.checked ? false : true;
    this.action = !event.target.checked ? 'disable' : 'enable';

    if (!event.target.checked) {
      this.sourceAccountForm.enable();
      // this.readOnly = false;
      this.modalBody =
        'The escrow account will exclusively accept deposits from added source accounts that have an "Active" status.';
    } else {
      this.sourceAccountForm.disable();
      // this.readOnly = true;
      if (!this.sourceAccounts || this.sourceAccounts.length === 0) {
        this.modalBody =
          'The Escrow Account will receive deposit from all bank accounts';
      } else {
        this.modalBody =
          'The functionality of all added source accounts will be deactivated, allowing the escrow to accept deposits from various bank accounts.';
      }
    }
    this.modalRef = this.modalService.open(modal);
    this.cdr.detectChanges();
  }

  nextForm() {
    if (this.enableSourceAccount) {
      if (
        this.sourceAccounts === undefined ||
        this.sourceAccounts?.length === 0
      ) {
        this.formErrors = ['Please add a source account'];
        return;
      }
    }
    this.emitNextTab.emit(true);
  }

  deleteConfirmationModal(
    modal: HTMLElement,
    name: string,
    bankAccountNumber: string,
    bankName: string,
    ifsc: string
  ) {
    let lastActiveAccount = this.sourceAccounts.filter(
      accounts => accounts.status === accountStatus.ACTIVE
    );
    this.lastAccount = lastActiveAccount.length === 1;
    this.name = name;
    this.bankAccountNumber = bankAccountNumber;
    this.bankName = bankName;
    this.ifsc = ifsc;
    this.modalRef = this.modalService.open(modal);
    this.cdr.detectChanges();
  }

  closeModal() {
    this.name = '';
    this.bankAccountNumber = '';
    this.bankName = '';
    this.ifsc = '';
    this.modalRef.close();
    this.cdr.detectChanges();
  }

  closeAllBankAccountModal() {
    this.modalBody = '';
    console.log(this.enableSourceAccountCheckBox);
    this.enableSourceAccountCheckBox = this.enableSourceAccountCheckBox
      ? false
      : true;
    if (this.enableSourceAccountCheckBox) {
      this.sourceAccountForm.disable();
    } else {
      this.sourceAccountForm.enable();
    }
    // this.readOnly = this.enableSourceAccountCheckBox ? true : false;
    this.modalRef.close();
    this.cdr.detectChanges();
  }

  updateSourceAccountValidation() {
    this.spinner.show();
    this.enableSourceAccount = this.enableSourceAccountCheckBox ? false : true;
    this.accountService
      .updateSourceAccountValidation(this.accountId, this.enableSourceAccount)
      .subscribe(resp => {
        if (resp.success) {
          this.toastBody = 'Source Account Validation updated Successfully.';
          this.toastHead = 'Success';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-success text-white'
          });
        }
        this.spinner.hide();
        // this.ngOnInit();
        this.cdr.detectChanges();
      });
    this.modalRef.close();
  }

  deleteSourceAccount() {
    let data: InputSourceAccount = {
      sourceAccount: {
        accountHolder: this.name,
        bankAccountNumber: this.bankAccountNumber,
        ifsc: this.ifsc,
        bankName: this.bankName,
        status: accountStatus.INACIVE
      }
    };
    this.accountService
      .updateSourceAccount(this.accountId, data)
      .subscribe(resp => {
        if (resp.result) {
          this.toastBody = 'Source Account Deactivated.';
          this.toastHead = 'Success';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-success text-white'
          });
        }
        this.ngOnInit();
      });
    this.modalRef.close();
  }

  convertToLocalTime(date: Date) {
    return moment
      .utc(date)
      .local()
      .format('DD-MMM-YY');
  }
  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 9000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }
}

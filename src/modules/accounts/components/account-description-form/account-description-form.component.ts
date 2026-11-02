import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
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
import { UtilityService } from '@common/services';
import bankTypes from '@modules/accounts/constants/banksTypes';
import {
  AccountDescriptionDetail,
  AccountDescriptionRespModel
} from '@modules/accounts/models';
import { AccountsService } from '@modules/accounts/services';
import { Merchant } from '@modules/auth/models/merchant.model';
import { AuthService } from '@modules/auth/services';
import { ProfileResponseModel } from '@modules/profile/models';
import { ProfileService } from '@modules/profile/services';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { forEach } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'sbpro-account-description-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-description-form.component.pug',
  styleUrls: ['account-description-form.component.scss']
})
export class AccountDescriptionFormComponent implements OnInit {
  /**
   * class variables
   */
  model!: NgbDateStruct;
  accountForm!: FormGroup;
  errors: string[] = [];
  startDateMin!: NgbDateStruct;
  submitting = false;
  submitted = false;
  multiBanks = [{ accountNo: '', accountName: '' }];
  private _loading$ = new BehaviorSubject(false);
  merchants: Merchant[] = [];
  selectedMerchant: Merchant | undefined;
  public isAdmin = false;
  email_regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  invalidEmails: string[] = [];
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }
  private _loadingList$ = new BehaviorSubject(false);
  selectedBankAccount: any = '';

  // private emailPattern = '[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}';

  /**
   * outbounds
   */
  @Output() emitCache: EventEmitter<
    AccountDescriptionDetail
  > = new EventEmitter<AccountDescriptionDetail>();
  @Output() emitNextTab: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() emitMerchantId: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitSelectedBank: EventEmitter<string> = new EventEmitter<string>();

  /**
   * inbounds
   */
  @Input() cachedForm?: AccountDescriptionDetail;
  @Input() accountId?: string;
  @Input() currentTab = 0;
  public banks: string[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private accountsService: AccountsService,
    private calendar: NgbCalendar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private profileService: ProfileService,
    private utilityService: UtilityService
  ) {
    localStorage.removeItem('account_bool');
    const dNow = new Date();
    this.startDateMin = calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );
    this.isAdmin = this.authService.isSuperAdmin();
  }

  /**
   *
   * @returns Null value if comma seprated email are not valid, else returns emailValidationError
   */
  validateMultipleEmails() {
    return (input: FormControl) => {
      if (!input.value) return null;

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
   * Create this function
   * just to avoid formatting issues in pug file
   *
   * @param bank
   * @returns
   */
  resolveBankName(bank: string) {
    return bank
      .toUpperCase()
      .split('_')
      .join(' ');
  }

  ngOnInit() {
    this.accountForm = this.formBuilder.group({
      name: [this.cachedForm?.name, Validators.required],
      purpose: [this.cachedForm?.purpose, Validators.required],
      email: [this.cachedForm?.email || null, [this.validateMultipleEmails()]],
      validity: [this.cachedForm?.validity, Validators.required],
      startDate: [this.cachedForm?.startDate, Validators.required],
      expectedVolume: [this.cachedForm?.expectedVolume],
      bank: [this.banks[0]],
      account: [this.multiBanks[0]]
    });
    this.accountForm.valueChanges.subscribe(data => {
      console.log('Form changes', data);
      this.checkFormValue(data)
        ? localStorage.setItem('account_bool', 'false')
        : localStorage.setItem('account_bool', 'true');
    });

    this.getMerchants('');
    this.getBanksAvailable();
    this.cdr.detectChanges();
  }

  checkFormValue(data: any): boolean {
    for (let key in data) {
      if (data[key] !== null && data[key] !== '' && data[key] !== undefined) {
        return true;
      }
    }
    return false;
  }

  getBanksAvailable() {
    this._loadingList$.next(true);
    if (!(this.isAdmin && !this.selectedMerchant)) {
      this.profileService
        .getProfile(
          this.selectedMerchant ? this.selectedMerchant.merchantId : null,
          false
        )
        .subscribe((resp: ProfileResponseModel) => {
          if (resp.result.banks) {
            for (const bank of resp.result.banks) {
              switch (bank.bankName) {
                case bankTypes.RBL: {
                  this.banks.push(bankTypes.RBL);
                  break;
                }
                case bankTypes.ICICI: {
                  this.banks.push(bankTypes.ICICI);
                  break;
                }
                case bankTypes.YES_BANK: {
                  this.banks.push(bankTypes.YES_BANK);
                  break;
                }
                case bankTypes.IDFC: {
                  this.banks.push(bankTypes.IDFC);
                  break;
                }
                case bankTypes.HDFC: {
                  this.banks.push(bankTypes.HDFC);
                  break;
                }
                case bankTypes.IBL: {
                  this.banks.push(bankTypes.IBL);
                  break;
                }
                case bankTypes.DBS: {
                  this.banks.push(bankTypes.DBS);
                  break;
                }
                case bankTypes.AXIS: {
                  this.banks.push(bankTypes.AXIS);
                  break;
                }
                default: {
                  break;
                }
              }
            }
          }
          if (this.cachedForm && this.cachedForm?.bank !== this.banks[0]) {
            forEach(this.banks, bank => {
              if (this.cachedForm?.bank === bank) {
                var idx = this.banks.indexOf(bank);
                var temp = this.banks[0];
                this.banks[0] = this.cachedForm?.bank;
                this.banks[idx] = temp;
              }
            });
            this.emitCache.emit(this.cachedForm);
          }
          this.accountForm.controls.bank.setValue(
            this.banks[0] ? this.banks[0] : ''
          );
          this.emitSelectedBank.emit(this.accountForm.value.bank);
          this.updateHardEscrowAccounts(this.banks[0]);
          this.cdr.detectChanges();
          this._loadingList$.next(true);
        });
    }
    this.cdr.detectChanges();
  }

  /**
   * form getters
   */
  get name() {
    return this.accountForm.get('name');
  }

  get purpose() {
    return this.accountForm.get('purpose');
  }

  get emailControl() {
    return this.accountForm.get('email') as FormControl;
  }

  get emailControlValid() {
    // don't validate the emails field if it is empty
    if (!this.emailControl.value) return null;
    return this.emailControl.touched && !this.emailControlInvalid;
  }

  get emailControlInvalid() {
    return (
      this.emailControl.touched &&
      (this.emailControl.hasError('required') ||
        this.emailControl.hasError('emailValidationError'))
    );
  }

  get validity() {
    return this.accountForm.get('validity');
  }

  get startDate() {
    return this.accountForm.get('startDate');
  }

  get expectedVolume() {
    return this.accountForm.get('expectedVolume');
  }

  get valid() {
    return this.accountForm.valid;
  }

  getMerchants(term: string) {
    this._loadingList$.next(true);

    this.accountsService.merchant$.subscribe(resp => {
      this._loadingList$.next(false);
      this.merchants = resp;
      this.cdr.detectChanges();
    });

    this.accountsService.getMerchants(term);
  }

  onSubmit() {
    if (!this.accountForm.valid) {
      return;
    }

    this.emitSelectedBank.emit(this.accountForm.value.bank);
    const email =
      this.accountForm.controls.email.value
        ?.split(',')
        .map((val: string) => val.trim()) || null;
    this.submitting = true;
    // parse date from desc form
    const dateObj = this.accountForm.controls.startDate.value;
    const formData = new FormData();
    formData.append('name', this.accountForm.controls.name.value);
    formData.append('email', email);
    formData.append('purpose', this.accountForm.controls.purpose.value);
    formData.append('validity', this.accountForm.controls.validity.value);
    formData.append(
      'expectedVolume',
      this.accountForm.controls.expectedVolume.value || 0
    );

    formData.append(
      'bank',
      this.accountForm.controls.bank.value
        .split(' ')
        .join('_')
        .toLowerCase() || bankTypes.ICICI
    );
    if (
      this.accountForm.controls.account.value &&
      this.multiBanks.length >= 1
    ) {
      if (_.has(this.accountForm.controls.account.value, 'accountNo')) {
        formData.append(
          'hardEscrowAccountNumber',
          this.accountForm.controls.account.value.accountNo
        );
      } else {
        formData.append(
          'hardEscrowAccountNumber',
          this.accountForm.controls.account.value
        );
      }
    }

    formData.append(
      'startDate',
      new Date(dateObj.year, dateObj.month - 1, dateObj.day).toISOString()
    );

    if (!this.cachedForm) {
      this.createAccount(formData);
      return;
    }
    this.patchAccount(formData);
    return;
  }

  removeOldErrors() {
    this.errors = [];
    this.cdr.detectChanges();
  }

  /**
   * call to service
   */
  createAccount(formData: FormData) {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.removeOldErrors();

    this._loading$.next(true);
    this.accountsService
      .addAccount(
        formData,
        this.selectedMerchant ? this.selectedMerchant.merchantId : undefined
      )
      .subscribe(
        (resp: AccountDescriptionRespModel) => {
          this._loading$.next(false);
          this.submitting = false;
          if (resp.success) {
            const respCache = this.accountForm.value;
            respCache.accountId = resp.result.accountId;
            this.emitCache.emit(respCache);
            this.emitNextTab.emit(true);
            return;
          }
          this.errors.push('server error. please try again.');
        },
        err => {
          this._loading$.next(false);
          if (err.status === 0) {
            this.errors = ['Connection Error'];
          } else {
            this.errors = err.error.errors;
          }
          this.cdr.detectChanges();
        }
      );
  }

  patchAccount(formData: FormData) {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.removeOldErrors();

    this.accountsService.updateAccount(this.accountId, formData).subscribe(
      (resp: AccountDescriptionRespModel) => {
        this.submitting = false;
        if (resp.success) {
          const respCache = this.accountForm.value;
          respCache.accountId = this.cachedForm?.accountId;
          this.emitCache.emit(respCache);
          return;
        }
        this.errors.push('server error. please try again.');
      },
      err => {
        if (err.status === 0) {
          this.errors = ['Connection Error'];
        } else {
          this.errors = err.error.errors;
        }
        this.cdr.detectChanges();
      }
    );
  }

  updateAccount(event: Event) {
    //Update Hard Escrow Accounts if any
    this.emitSelectedBank.emit((event.target as HTMLInputElement).value);
    this.updateHardEscrowAccounts((event.target as HTMLInputElement).value);
    this.cdr.detectChanges();
  }

  updateHardEscrow(event: Event) {
    const selectedHardEscrowNumber = (event.target as HTMLInputElement).value
      .split('|')[1]
      .trim();
    this.accountForm.controls.account.setValue(
      selectedHardEscrowNumber as string
    );
    this.cdr.detectChanges();
  }

  updateMerchant($event: any) {
    if (this.selectedMerchant) {
      this.emitMerchantId.emit(this.selectedMerchant.merchantId);
      this.getBanksAvailable();
      this.cdr.detectChanges();
    } else {
      this.accountForm.reset();
    }
  }

  //Fetch Hard Escrow Accounts if any for target bank
  updateHardEscrowAccounts(bank: string) {
    this._loadingList$.next(true);
    if (!(this.isAdmin && !this.selectedMerchant)) {
      this.multiBanks = [];
      this.profileService
        .getProfile(
          this.selectedMerchant ? this.selectedMerchant.merchantId : null,
          false
        )
        .subscribe((resp: ProfileResponseModel) => {
          switch (bank) {
            case bankTypes.ICICI: {
              if (resp.result.iciciBanks) {
                resp.result.iciciBanks.forEach(val => {
                  if (
                    val.enableConnectedBanking &&
                    val.enableConnectedBankingWithVA
                  ) {
                    this.multiBanks.push({
                      accountNo: val.accountNo as string,
                      accountName: val.accountName as string
                    });
                  } else if (
                    val?.enableConnectedBanking === undefined ||
                    !val?.enableConnectedBanking
                  ) {
                    this.multiBanks.push({
                      accountNo: val.accountNo as string,
                      accountName: val.accountName as string
                    });
                  }
                });
                if (this.cachedForm && this.cachedForm?.account) {
                  this.setCachedBankAccount();
                } else {
                  this.accountForm.controls.account.setValue(
                    this.multiBanks[0] ? this.multiBanks[0] : ''
                  );
                }
              }
              break;
            }
            case bankTypes.RBL: {
              if (resp.result.rblBanks) {
                resp.result.rblBanks.forEach(val => {
                  if (
                    val.enableConnectedBanking &&
                    val.enableConnectedBankingWithVA
                  ) {
                    this.multiBanks.push({
                      accountNo: val.accountNo as string,
                      accountName: val.accountName as string
                    });
                  } else if (
                    val?.enableConnectedBanking === undefined ||
                    !val?.enableConnectedBanking
                  ) {
                    this.multiBanks.push({
                      accountNo: val.accountNo as string,
                      accountName: val.accountName as string
                    });
                  }
                });
                if (this.cachedForm && this.cachedForm?.account) {
                  this.setCachedBankAccount();
                } else {
                  this.accountForm.controls.account.setValue(
                    this.multiBanks[0] ? this.multiBanks[0] : ''
                  );
                }
              }
              break;
            }
            case bankTypes.YES_BANK: {
              if (resp.result.yesBanks) {
                resp.result.yesBanks.forEach(val => {
                  if (
                    val?.enableConnectedBanking &&
                    val?.enableConnectedBankingWithVA
                  ) {
                    this.multiBanks.push({
                      accountNo: val.accountNo as string,
                      accountName: val.accountName as string
                    });
                  } else if (
                    val?.enableConnectedBanking === undefined ||
                    !val?.enableConnectedBanking
                  ) {
                    this.multiBanks.push({
                      accountNo: val.accountNo as string,
                      accountName: val.accountName as string
                    });
                  }
                });
                if (this.cachedForm && this.cachedForm?.account) {
                  this.setCachedBankAccount();
                } else {
                  this.accountForm.controls.account.setValue(
                    this.multiBanks[0] ? this.multiBanks[0] : ''
                  );
                }
              }
              break;
            }
            case bankTypes.IDFC: {
              if (resp.result.idfcBanks) {
                resp.result.idfcBanks.forEach(val => {
                  if (
                    val?.enableConnectedBanking &&
                    val?.enableConnectedBankingWithVA
                  ) {
                    this.multiBanks.push({
                      accountNo: val.accountNo as string,
                      accountName: val.accountName as string
                    });
                  } else if (
                    val?.enableConnectedBanking === undefined ||
                    !val?.enableConnectedBanking
                  ) {
                    this.multiBanks.push({
                      accountNo: val.accountNo as string,
                      accountName: val.accountName as string
                    });
                  }
                });
                if (this.cachedForm && this.cachedForm?.account) {
                  this.setCachedBankAccount();
                } else {
                  this.accountForm.controls.account.setValue(
                    this.multiBanks[0] ? this.multiBanks[0] : ''
                  );
                }
              }
              break;
            }
            case bankTypes.HDFC: {
              if (resp.result.hdfcBanks) {
                resp.result.hdfcBanks.forEach(val => {
                  this.multiBanks.push({
                    accountNo: val.accountNo as string,
                    accountName: val.accountName as string
                  });
                });
                if (this.cachedForm && this.cachedForm?.account) {
                  this.setCachedBankAccount();
                } else {
                  this.accountForm.controls.account.setValue(
                    this.multiBanks[0] ? this.multiBanks[0] : ''
                  );
                }
              }
              break;
            }

            case bankTypes.IBL: {
              if (resp.result.iblBanks) {
                resp.result.iblBanks.forEach(val => {
                  this.multiBanks.push({
                    accountNo: val.accountNo as string,
                    accountName: val.accountName as string
                  });
                });
                if (this.cachedForm && this.cachedForm?.account) {
                  this.setCachedBankAccount();
                } else {
                  this.accountForm.controls.account.setValue(
                    this.multiBanks[0] ? this.multiBanks[0] : ''
                  );
                }
              }
              break;
            }

            case bankTypes.DBS: {
              if (resp.result.dbsBanks) {
                resp.result.dbsBanks.forEach(val => {
                  if (
                    val?.enableConnectedBanking &&
                    val?.enableConnectedBankingWithVA
                  ) {
                    this.multiBanks.push({
                      accountNo: val.accountNo as string,
                      accountName: val.accountName as string
                    });
                  } else if (
                    val?.enableConnectedBanking === undefined ||
                    !val?.enableConnectedBanking
                  ) {
                    this.multiBanks.push({
                      accountNo: val.accountNo as string,
                      accountName: val.accountName as string
                    });
                  }
                });
                if (this.cachedForm && this.cachedForm?.account) {
                  this.setCachedBankAccount();
                } else {
                  this.accountForm.controls.account.setValue(
                    this.multiBanks[0] ? this.multiBanks[0] : ''
                  );
                }
              }
              break;
            }

            case bankTypes.AXIS: {
              if (resp.result.axisBanks) {
                resp.result.axisBanks.forEach(val => {
                  if (
                    val?.enableConnectedBanking &&
                    val?.enableConnectedBankingWithVA
                  ) {
                    this.multiBanks.push({
                      accountNo: val.accountNo as string,
                      accountName: val.accountName as string
                    });
                  } else if (
                    val?.enableConnectedBanking === undefined ||
                    !val?.enableConnectedBanking
                  ) {
                    this.multiBanks.push({
                      accountNo: val.accountNo as string,
                      accountName: val.accountName as string
                    });
                  }
                });
                if (this.cachedForm && this.cachedForm?.account) {
                  this.setCachedBankAccount();
                } else {
                  this.accountForm.controls.account.setValue(
                    this.multiBanks[0] ? this.multiBanks[0] : ''
                  );
                }
              }
              break;
            }

            default: {
              break;
            }
          }
          this.cdr.detectChanges();
          this._loadingList$.next(false);
        });
    }
  }

  setCachedBankAccount() {
    let selectedAccounts = this.multiBanks.find(
      account => account.accountNo === this.cachedForm?.account
    );
    this.selectedBankAccount = (selectedAccounts?.accountName.trim() +
      ' | ' +
      selectedAccounts?.accountNo.trim()) as string;

    this.accountForm.controls.account.setValue(
      selectedAccounts?.accountNo as string
    );
    console.log(this.selectedBankAccount);
    this.cdr.detectChanges();
  }
}

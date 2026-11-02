import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { OtpModalComponent } from '@common/components/otpmodal/otp-modal.component';
import { UtilityService } from '@common/services';
import banksTypes from '@modules/accounts/constants/banksTypes';
import { Account } from '@modules/accounts/models';
import { AccountsAdminService } from '@modules/accounts/services';
import { PayeeValidationType } from '@modules/auth/constants/payeeValidationsType.enum';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { MerchantService } from '@modules/merchant/services';
import { ProfileResponseModel } from '@modules/profile/models';
import { ProfileService } from '@modules/profile/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import smsMsg91TemplateId from 'config/smsMsg91TemplateId';
import { environment } from 'environments/environment';
import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '@modules/auth/services';
import DateHelper from 'helpers/date.helper';
import { Moment } from 'moment';

@Component({
  selector: 'sbpro-merchant-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './merchant-settings.component.pug',
  styleUrls: ['merchant-settings.component.scss']
})
export class MerchantSettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  authorizerList!: FormArray;
  errors: string[] = [];
  @Input() merchantName = '';
  @Input() merchantId = '';
  @Input() accountId = '';
  @Input() merchantEmail = '';
  activated = true;
  toastHead = '';
  toastBody = '';
  merchantMode = 'Portal';
  webHookAuthType = 'token';
  upiCollectEnabled = false;
  vpaCount = '5';
  mccCode = '';
  isProduction = environment.production;
  merchantProfile!: MerchantProfile;
  banks: string[] = [];
  // banks = [{}];
  pennyDropChargesAccounts!: Account[];
  selectedAccount: any = null;
  accounts$!: Observable<Account[]>;
  payeeValidationDebitAccountId!: string;
  email_regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  invalidEmails: string[] = [];
  isPayeeValidationEnables$ = new BehaviorSubject<boolean>(false);
  rblPaymentType = 'API';
  payeeValidationType: PayeeValidationType = PayeeValidationType.DIGIO;
  private _loading$ = new BehaviorSubject(false);
  caFile = '';
  xApiKeyExist = false;
  tempApikey = false;
  xApiKeyValue = '';
  xApiKeyGeneratedAt: string | Moment = '';
  isAuthorized = false;
  connectedBanking = false;
  isIDFCWhiteLabel = false;
  isTransferNotificationDisabled = false;
  isPayeeNotificationDisabled = false;
  sourceAccountValidation = false;
  enableBalanceRefresh: boolean = false;
  webhookEncryptionEnabled: boolean = false;
  dateHelper = new DateHelper();
  whKeyGenerated: Boolean = false;
  whKeyHashed: Boolean = false;
  isCopied: Boolean = false;
  isDepositNotificationDisabled = false;
  isAccountNotificationDisabled = false;
  ivGenerated: Boolean = false;
  payeeAdditionWithTrusteeApproval: Boolean = false;
  payeeAuthorizerWithOTP: Boolean = false;
  reportSectionEnabled: Boolean = false;

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  get authorizerFormGroup() {
    return this.settingsForm.get('authorizers') as FormArray;
  }

  constructor(
    private formBuilder: FormBuilder,
    private merchantService: MerchantService,
    private utilityService: UtilityService,
    private modalService: NgbModal,
    private accountService: AccountsAdminService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private authService: AuthService
  ) {
    this.settingsForm = this.formBuilder.group({
      statementFrequency: ['monthly'],
      mode: ['Portal', Validators.required],
      webHookAuthType: ['token'],
      thirdPartyTransfer: [false],
      escrowQRCheckBox: false,
      upiEnabledCheckbox: false,
      upiPayoutEnabledCheckbox: false,
      mccCode: [''],
      vpaCount: [
        0,
        [Validators.maxLength(32), Validators.min(0), Validators.max(10000)]
      ],
      isAccAddCheckbox: false,
      bankVerification: false,
      escrowPagePG: false,
      enableKYC: false,
      payeeValidationType: PayeeValidationType.DIGIO,
      enablePayeeValidation: false,
      account: [this.selectedAccount],
      enableTesting: false,
      isBulkPayeeEnabled: false,
      idfcEmail: '',
      costPerValidation: [1, [Validators.min(0)]],
      minPercentageMatch: [60, [Validators.max(100)]],
      noAccAllowed: [
        0,
        [Validators.maxLength(32), Validators.min(0), Validators.max(50000)]
      ],
      merchantAccessCode: [''],
      pgSettlementAccount: [''],
      pineMerchantId: [''],
      merchantSecretKey: [''],
      transferHookURL: [''],
      transferHookToken: [''],
      transferHookBasicAuthUser: [''],
      transferHookBasicAuthPass: [''],
      depositHookToken: [''],
      depositHookURL: [''],
      depositHookBasicAuthUser: [''],
      depositHookBasicAuthPass: [''],
      accountDocumentMandatoryForAPI: [false],
      rblPaymentType: ['API'],
      connectedBankingCheckBox: false,
      idfcWhiteLabelCheckBox: false,
      transferNotificationCheckBox: false,
      depositNotificationCheckBox: false,
      accountNotificationCheckBox: false,
      payeeNotificationCheckBox: false,
      sourceAccountValidation: false,
      refreshBalanceCheckBox: false,
      webhookEncryptionEnabled: false,
      webhookEncryptionKey: [
        null,
        [
          this.utilityService.exactLengthValidator(32),
          this.utilityService.noSpaceValidator()
        ]
      ],
      webhookEncryptionIv: [
        null,
        [
          this.utilityService.exactLengthValidator(16),
          this.utilityService.noSpaceValidator()
        ]
      ],
      idfcDealId: [''],
      reportSectionEnabled: false,
      payeeAdditionWithTrusteeApproval: false,
      payeeAuthorizerWithOTP: false
    });

    this.isPayeeValidationEnables$.subscribe(resp => {
      // if (resp) {
      //   this.account?.setValidators(Validators.required);
      //   this.idfcEmailControl.setValidators([this.validateMultipleEmails()]);
      // }
      console.log(resp);
    });
  }

  payeeValidationTypeChange(validationType: string) {
    if (validationType === PayeeValidationType.IDFC) {
      this.accountService.bank = banksTypes.IDFC;
    } else {
      this.accountService.bank = '';
    }
    this.accountService.performSearch();
    this.accountService.account$.subscribe(resp => {
      this.pennyDropChargesAccounts = resp;
      this.selectedAccount = this.pennyDropChargesAccounts[0];
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    let adminEmail = this.authService.getEmail();
    // @ts-ignore
    if (
      environment.enableXAPIKey &&
      environment.enableXAPIKey.split(',').includes(adminEmail as string)
    ) {
      this.isAuthorized = true;
    }
    if (this.merchantId) {
      this.profileService.getDocs(this.merchantId).subscribe(resp => {
        this.caFile = resp.result.docCAOriginal;
        if (!this.caFile) {
          this.errors.push(
            'Please upload Commercial Agreement to activate merchant!'
          );
        }
        this.spinner.hide();
      });
      this.spinner.show();
      this.accountService.merchantId = this.merchantId;
      if (this.hasBank(banksTypes.IDFC)) {
        this.accountService.bank = banksTypes.IDFC;
        this.payeeValidationType = PayeeValidationType.IDFC;
      }
      this.accountService.performSearch();
      this.accountService.account$.subscribe(resp => {
        this.pennyDropChargesAccounts = resp;
      });
      this.profileService
        .getProfile(this.merchantId, false)
        .subscribe((resp: ProfileResponseModel) => {
          console.log(resp);
          this.merchantProfile = resp.result;
          if (resp.result) {
            this.settingsForm.controls.mode.setValue(
              resp.result.mode || 'Portal'
            );
            this.merchantMode = resp.result.mode || 'Portal';

            if (resp.result.mode === 'API') {
              this.settingsForm.controls.webHookAuthType.setValue(
                resp.result.webHook?.webHookAuthType || 'token'
              );
              this.webHookAuthType =
                resp.result.webHook?.webHookAuthType || 'token';
            }

            if (resp.result.xApiKey) {
              this.xApiKeyExist = true;
              this.xApiKeyValue = resp.result.xApiKey;
              this.xApiKeyGeneratedAt =
                this.dateHelper.convertToTimeZone(
                  (resp.result.xApiKeyGeneratedAt as unknown) as Date,
                  'Asia/Kolkata'
                ) || '';
            }

            this.settingsForm.controls.statementFrequency.setValue(
              resp.result.statementFrequency || 'monthly'
            );
            this.activated = resp.result.verified;
            this.settingsForm.controls.thirdPartyTransfer.setValue(
              resp.result.thirdPartyTransfer || false
            );
            if (resp.result.webHook && resp.result.webHook.transferHookURL) {
              this.settingsForm.controls.transferHookURL.setValue(
                resp.result.webHook.transferHookURL
              );
            }
            if (resp.result.webHook && resp.result.webHook.transferHookToken) {
              this.settingsForm.controls.transferHookToken.setValue(
                resp.result.webHook.transferHookToken
              );
            }
            if (
              resp.result.webHook &&
              resp.result.webHook.transferHookBasicAuthUser
            ) {
              this.settingsForm.controls.transferHookBasicAuthUser.setValue(
                resp.result.webHook.transferHookBasicAuthUser
              );
            }
            if (
              resp.result.webHook &&
              resp.result.webHook.transferHookBasicAuthPass
            ) {
              this.settingsForm.controls.transferHookBasicAuthPass.setValue(
                resp.result.webHook.transferHookBasicAuthPass
              );
            }
            if (resp.result.webHook && resp.result.webHook.depositHookURL) {
              this.settingsForm.controls.depositHookURL.setValue(
                resp.result.webHook.depositHookURL
              );
            }
            if (resp.result.webHook && resp.result.webHook.depositHookToken) {
              this.settingsForm.controls.depositHookToken.setValue(
                resp.result.webHook.depositHookToken
              );
            }
            if (
              resp.result.webHook &&
              resp.result.webHook.depositHookBasicAuthUser
            ) {
              this.settingsForm.controls.depositHookBasicAuthUser.setValue(
                resp.result.webHook.depositHookBasicAuthUser
              );
            }
            if (
              resp.result.webHook &&
              resp.result.webHook.depositHookBasicAuthPass
            ) {
              this.settingsForm.controls.depositHookBasicAuthPass.setValue(
                resp.result.webHook.depositHookBasicAuthPass
              );
            }

            if (
              resp.result.webHook &&
              resp.result.webHook.webhookEncryptionEnabled
            ) {
              this.settingsForm.controls.webhookEncryptionEnabled.setValue(
                resp.result.webHook.webhookEncryptionEnabled
              );
            }

            if (
              resp.result.webHook &&
              resp.result.webHook.webhookEncryptionKey
            ) {
              this.settingsForm.controls.webhookEncryptionKey.setValue(
                resp.result.webHook.webhookEncryptionKey
              );
              this.whKeyGenerated = true;
              this.whKeyHashed = true;
            }

            if (
              resp.result.webHook &&
              resp.result.webHook.webhookEncryptionIv
            ) {
              this.settingsForm.controls.webhookEncryptionIv.setValue(
                resp.result.webHook.webhookEncryptionIv
              );
              this.ivGenerated = true;
            }

            //UPI details
            if (resp.result.upiEnabled) {
              this.upiCollectEnabled = true;
              this.settingsForm.controls.upiEnabledCheckbox.setValue(true);
              this.vpaCount = resp.result.vpaCount.toString();
            }

            if (resp?.result?.mccCode) {
              this.settingsForm.controls.mccCode.setValue(resp.result.mccCode);
            }

            if (resp.result.upiPayoutEnabled) {
              this.settingsForm.controls.upiPayoutEnabledCheckbox.setValue(
                true
              );
            }
            // Escrow QR details
            if (resp.result.escrowQrEnabled) {
              this.settingsForm.controls.escrowQRCheckBox.setValue(true);
            }

            // Check if Virtual Account Addition Allowed
            if (resp.result.isAccountAddAllowed) {
              this.settingsForm.controls.isAccAddCheckbox.setValue(true);
              this.settingsForm.controls.noAccAllowed.setValue(
                resp.result.noAccAllowed
              );
            }

            if (resp.result.escrowPagePG) {
              this.settingsForm.controls.escrowPagePG.setValue(true);
              this.settingsForm.controls.merchantAccessCode.setValue(
                resp.result.pinePGKeys.merchantAccessCode
              );
              this.settingsForm.controls.pgSettlementAccount.setValue(
                resp.result.pgSettlementAccount
              );
              this.settingsForm.controls.pineMerchantId.setValue(
                resp.result.pinePGKeys.pineMerchantId
              );
              this.settingsForm.controls.merchantSecretKey.setValue(
                resp.result.pinePGKeys.merchantSecretKey
              );
            }

            if (resp.result.bankVerification) {
              this.settingsForm.controls.bankVerification.setValue(true);
            }

            if (resp.result.escrowPagePG) {
              this.settingsForm.controls.escrowPagePG.setValue(true);
            }

            if (resp.result.enableKYC) {
              this.settingsForm.controls.enableKYC.setValue(true);
            }

            if (resp.result.enablePayeeValidation) {
              this.settingsForm.controls.enablePayeeValidation.setValue(true);
              this.isPayeeValidationEnables$?.next(true);
            }

            if (resp.result.enableTesting) {
              this.settingsForm.controls.enableTesting.setValue(true);
            }
            if (resp.result.isBulkPayeeEnabled) {
              this.settingsForm.controls.isBulkPayeeEnabled.setValue(true);
              this.settingsForm
                .get('account')
                ?.setValidators(Validators.required);
              this.settingsForm
                .get('email')
                ?.setValidators(Validators.required);
            }

            if (resp.result.payeeValidationEmails) {
              this.idfcEmailControl.setValue(resp.result.payeeValidationEmails);
            }

            if (resp.result.payeeValidationType) {
              this.payeeValidationType = resp.result.payeeValidationType;
            }

            if (!_.isUndefined(resp.result.costPerValidation)) {
              this.costPerValidationControl.setValue(
                resp.result.costPerValidation
              );
            }
            if (!_.isUndefined(resp.result.minPercentageMatch)) {
              this.minPercentageMatchControl.setValue(
                resp.result.minPercentageMatch
              );
            }

            if (resp.result.banks) {
              this.banks = resp.result.banks as any;
            }

            if (resp.result.accountDocumentMandatoryForAPI) {
              this.settingsForm.controls.accountDocumentMandatoryForAPI.setValue(
                true
              );
            }

            if (resp.result.payeeValidationDebitAccountId) {
              this.payeeValidationDebitAccountId =
                resp.result.payeeValidationDebitAccountId;
              this.accountService
                .getAccount(this.payeeValidationDebitAccountId)
                .subscribe(resp => {
                  this.selectedAccount = resp.result;
                  this.cdr.detectChanges();
                });
            }

            let rblBank = resp.result.banks.filter(bank => {
              return bank.bankName === banksTypes.RBL;
            });
            if (rblBank) {
              this.settingsForm.controls.rblPaymentType.setValue(
                rblBank[0]?.paymentType
              );
            }

            if (resp.result.connectedBanking) {
              this.settingsForm.controls.connectedBankingCheckBox.setValue(
                true
              );
            }

            if (resp.result.isIDFCWhiteLabel) {
              this.settingsForm.controls.idfcWhiteLabelCheckBox.setValue(true);
            }

            if (resp.result.isTransferNotificationDisabled) {
              this.settingsForm.controls.transferNotificationCheckBox.setValue(
                true
              );
            }

            if (resp.result.isPayeeNotificationDisabled) {
              this.settingsForm.controls.payeeNotificationCheckBox.setValue(
                true
              );
            }

            if (resp.result.sourceAccountValidation) {
              this.settingsForm.controls.sourceAccountValidation.setValue(true);
            }

            if (resp.result.enableBalanceRefresh) {
              this.settingsForm.controls.refreshBalanceCheckBox.setValue(true);
            }

            if (resp.result.idfcDealId) {
              this.settingsForm.controls.idfcDealId.setValue(
                resp.result.idfcDealId
              );
            }

            if (resp.result.isDepositNotificationDisabled) {
              this.settingsForm.controls.depositNotificationCheckBox.setValue(
                true
              );
            }

            if (resp.result.isAccountNotificationDisabled) {
              this.settingsForm.controls.accountNotificationCheckBox.setValue(true);
            }

            if (resp.result.reportSectionEnabled) {
              this.settingsForm.controls.reportSectionEnabled.setValue(true);
            }

            if (resp.result?.payeeAuthorizerSettings?.enabled) {
              this.settingsForm.controls.payeeAdditionWithTrusteeApproval.setValue(true);
            }

            if (resp.result?.payeeAuthorizerSettings?.withOTP) {  
              this.settingsForm.controls.payeeAuthorizerWithOTP.setValue(true);
            }

            this.cdr.detectChanges();
          }
        });
    } else {
      this.cdr.detectChanges();
    }
  }
  get xapiKeyControl() {
    return this.settingsForm.get('xapiKey')?.value;
  }

  get idfcEmailControl() {
    return this.settingsForm.get('idfcEmail') as FormControl;
  }

  get costPerValidationControl() {
    return this.settingsForm.get('costPerValidation') as FormControl;
  }

  get costPerValidationValid() {
    // don't validate the emails field if it is empty
    if (!this.costPerValidationControl.value) return null;
    return (
      this.costPerValidationControl.touched && !this.costPerValidationInvalid
    );
  }

  get costPerValidationInvalid() {
    return (
      this.costPerValidationControl.touched &&
      (this.costPerValidationControl.hasError('required') ||
        this.costPerValidationControl.hasError('costPerValidationError'))
    );
  }

  get minPercentageMatchControl() {
    return this.settingsForm.get('minPercentageMatch') as FormControl;
  }

  get minPercentageMatchValid() {
    // don't validate the emails field if it is empty
    if (!this.minPercentageMatchControl.value) return null;
    return (
      this.minPercentageMatchControl.touched && !this.minPercentageMatchInvalid
    );
  }

  get minPercentageMatchInvalid() {
    return (
      this.minPercentageMatchControl.touched &&
      (this.minPercentageMatchControl.hasError('required') ||
        this.minPercentageMatchControl.hasError('minPercentageMatchError'))
    );
  }

  get webhookEncryptionKey() {
    return this.settingsForm.get('webhookEncryptionKey');
  }

  get webhookEncryptionIv() {
    return this.settingsForm.get('webhookEncryptionIv');
  }

  /**
   *
   * @returns Null value if comma seprated email are not valid, else returns emailValidationError
   */
  validateMultipleEmails(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const emails = control.value?.split(',').map((val: string) => val.trim());

      if (!emails) return null;
      this.invalidEmails = [];
      for (let email of emails) {
        if (!this.email_regex.test(email)) {
          this.invalidEmails.push(email);
        }
      }
      const returnValue =
        this.invalidEmails.length <= 0
          ? null
          : { idfcEmailValidationError: true };
      return returnValue;
    };
  }

  updateAccount(event: any) {
    console.log('ACCOUNT ', event);
    // set form controls
    this.selectedAccount = event;
    this.cdr.detectChanges();
  }
  onModeChange() {
    this.merchantMode = this.settingsForm.controls.mode.value;
    this.cdr.detectChanges();
  }

  onWebHookAuthChange() {
    this.webHookAuthType = this.settingsForm.controls.webHookAuthType.value;
    this.cdr.detectChanges();
  }

  onRBLPaymentTypeChange(value: string) {
    this.rblPaymentType = value;
    console.log(this.rblPaymentType);
    this.cdr.detectChanges();
  }

  updateCheckBoxVal(formControlName: string, event: Event) {
    if (formControlName === 'enablePayeeValidation') {
      this.isPayeeValidationEnables$.next(
        (event.target as HTMLInputElement).checked
      );
    }
    this.settingsForm.controls[formControlName].patchValue(
      (event.target as HTMLInputElement).checked
    );

    if (
      formControlName === 'upiEnabledCheckbox' &&
      (event.target as HTMLInputElement).checked
    ) {
      this.upiCollectEnabled = true;
    } else if (
      formControlName === 'upiEnabledCheckbox' &&
      !(event.target as HTMLInputElement).checked
    ) {
      this.upiCollectEnabled = false;
    }
    if (
      formControlName === 'connectedBankingCheckBox' &&
      (event.target as HTMLInputElement).checked
    ) {
      this.connectedBanking = true;
    }

    if (
      formControlName === 'idfcWhiteLabelCheckBox' &&
      (event.target as HTMLInputElement).checked
    ) {
      this.isIDFCWhiteLabel = true;
    }

    if (
      formControlName === 'transferNotificationCheckBox' &&
      (event.target as HTMLInputElement).checked
    ) {
      this.isTransferNotificationDisabled = true;
    }

    if (
      formControlName === 'depositNotificationCheckBox' &&
      (event.target as HTMLInputElement).checked
    ) {
      this.isDepositNotificationDisabled = true;
    }

    if (
      formControlName === 'payeeNotificationCheckBox' &&
      (event.target as HTMLInputElement).checked
    ) {
      this.isPayeeNotificationDisabled = true;
    }

    if (
      formControlName === 'accountNotificationCheckBox' &&
      (event.target as HTMLInputElement).checked
    ) {
      this.isAccountNotificationDisabled = true;
    }

    if (
      formControlName === 'sourceAccountValidation' &&
      (event.target as HTMLInputElement).checked
    ) {
      this.sourceAccountValidation = true;
    }

    if (
      formControlName === 'refreshBalanceCheckBox' &&
      (event.target as HTMLInputElement).checked
    ) {
      this.enableBalanceRefresh = true;
    }

    if (
      formControlName === 'webhookEncryptionEnabled' &&
      (event.target as HTMLInputElement).checked
    ) {
      this.webhookEncryptionEnabled = true;
    } else if (
      formControlName === 'webhookEncryptionEnabled' &&
      !(event.target as HTMLInputElement).checked
    ) {
      this.webhookEncryptionEnabled = false;
      this.whKeyGenerated = false;
      this.ivGenerated = false;
      this.settingsForm.controls.webhookEncryptionKey.setValue(null);
      this.settingsForm.controls.webhookEncryptionIv.setValue(null);
    }

    if (formControlName === 'payeeAdditionWithTrusteeApproval' &&
      (event.target as HTMLInputElement).checked) {
      this.payeeAdditionWithTrusteeApproval = true;
    } else if ((formControlName === 'payeeAdditionWithTrusteeApproval' &&
      !(event.target as HTMLInputElement).checked)) {
      this.payeeAdditionWithTrusteeApproval = false;
    }

    if (formControlName === 'reportSectionEnabled' &&
      (event.target as HTMLInputElement).checked) {
      this.reportSectionEnabled = true;
    }
    this.cdr.detectChanges();
  }

  isAccountAdditionAllowed() {
    return this.settingsForm.controls.isAccAddCheckbox.value;
  }

  isEscrowPageAllowed() {
    return this.settingsForm.controls.escrowPagePG.value;
  }

  // form controls getters
  get account() {
    return this.settingsForm.get('account');
  }

  get enablePayeeValidation() {
    return this.settingsForm.get('enablePayeeValidation')?.value;
  }

  // fetch account on each key hit
  fetchAccount($event: any) {
    this.accountService.searchTerm = $event.term;
    this.accountService.performSearch();
    this.accountService.account$.subscribe(resp => {
      this.pennyDropChargesAccounts = resp;
      this.selectedAccount = this.pennyDropChargesAccounts[0];
      this.cdr.detectChanges();
    });
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    for (const name in controls) {
      console.log(controls[name]);
      if (controls[name].invalid) {
        this.errors.push('Please enter a valid ' + name);
      }
    }
  }

  removeOldErrors() {
    this.errors = [];
    console.log(this.errors);
    this.cdr.detectChanges();
  }

  onItemChange(value: boolean) {
    console.log(' Value is : ', value);
    this.settingsForm.controls.thirdPartyTransfer.setValue(value);
    this.cdr.detectChanges();
  }

  generateXapiKey() {
    this.spinner.show();
    this.profileService.generateXapiKey(this.merchantId).subscribe(resp => {
      this.xApiKeyValue = resp.result.xApiKey;
      this.xApiKeyGeneratedAt = resp.result.xApiKeyGeneratedAt;
      this.spinner.hide();
    });
  }

  onSubmit() {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.removeOldErrors();
    // console.log('called onSubmit');

    if (this.merchantId && !this.settingsForm.valid) {
      console.log('Invalid form values found');
      this.findInvalidControls(this.settingsForm);
      this.cdr.detectChanges();
      return;
    }

    this._loading$.next(true);

    if (
      this.settingsForm.controls.upiEnabledCheckbox.value &&
      this.settingsForm.value.mccCode === ''
    ) {
      this.toastBody = 'Please provide a valid MCC';
      this.toastHead = 'Failed';
      this.utilityService.showToast(this.toastHead, this.toastBody, {
        headerClasses: 'bg-danger text-white'
      });
      this.cdr.detectChanges();
      return null;
    }

    if (
      this.payeeValidationType === PayeeValidationType.IDFC &&
      (this.selectedAccount?.accountId === '' ||
        _.isUndefined(this.selectedAccount?.accountId))
    ) {
      this.toastBody = 'Please select an Account for IDFC Payee validation';
      this.toastHead = 'Failed';
      this.utilityService.showToast(this.toastHead, this.toastBody, {
        headerClasses: 'bg-danger text-white'
      });
      this.cdr.detectChanges();
      return null;
    }

    if (this.settingsForm.controls.escrowPagePG.value) {
      var flag = false;
      if (!this.settingsForm.controls.merchantAccessCode.value) {
        this.toastBody =
          'Merchant Access Code is required with Escrow Page PG Feature';
        this.toastHead = 'Failed';
        this.utilityService.showToast(this.toastHead, this.toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
        flag = true;
      }
      if (!this.settingsForm.controls.pineMerchantId.value) {
        this.toastBody =
          'Pine Merchant Id is required with Escrow Page PG Feature';
        this.toastHead = 'Failed';
        this.utilityService.showToast(this.toastHead, this.toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
        flag = true;
      }
      if (!this.settingsForm.controls.merchantSecretKey.value) {
        this.toastBody =
          'Merchant Secret Key is required with Escrow Page PG Feature';
        this.toastHead = 'Failed';
        this.utilityService.showToast(this.toastHead, this.toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
        flag = true;
      }
      if (!this.settingsForm.controls.pgSettlementAccount.value) {
        this.toastBody =
          'PG Settlement Account is required with Escrow Page PG Feature';
        this.toastHead = 'Failed';
        this.utilityService.showToast(this.toastHead, this.toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
        flag = true;
      }
      if (flag) {
        return null;
      }
    }

    const payeeValidationUpdateData = this.hasBank(banksTypes.IDFC)
      ? {
        enablePayeeValidation: this.settingsForm.controls
          .enablePayeeValidation.value,
        payeeValidationType: this.payeeValidationType,
        payeeValidationDebitAccountId: this.selectedAccount?.accountId,
        costPerValidation: this.settingsForm.controls.costPerValidation.value,
        minPercentageMatch: this.settingsForm.controls.minPercentageMatch
          .value,
        payeeValidationEmails: this.settingsForm.controls.idfcEmail.value
      }
      : {
        enablePayeeValidation: this.settingsForm.controls
          .enablePayeeValidation.value,
        payeeValidationType: this.payeeValidationType,
        costPerValidation: this.settingsForm.controls.costPerValidation.value,
        minPercentageMatch: this.settingsForm.controls.minPercentageMatch
          .value,
        payeeValidationEmails: this.settingsForm.controls.idfcEmail.value
      };

    const formData =
      this.merchantId.length > 0
        ? {
          mode: this.settingsForm.controls.mode.value,
          statementFrequency: this.settingsForm.controls.statementFrequency
            .value,
          thirdPartyTransfer: this.settingsForm.controls.thirdPartyTransfer
            .value,
          isAccountAddAllowed: this.settingsForm.controls.isAccAddCheckbox
            .value,
          bankVerification: this.settingsForm.controls.bankVerification.value,
          escrowPagePG: this.settingsForm.controls.escrowPagePG.value,
          enableKYC: this.settingsForm.controls.enableKYC.value,
          enableTesting: this.settingsForm.controls.enableTesting.value,
          isBulkPayeeEnabled: this.settingsForm.controls.isBulkPayeeEnabled
            .value,
          noAccAllowed: this.settingsForm.controls.noAccAllowed.value,
          pinePGKeys: {
            merchantAccessCode: this.settingsForm.controls.merchantAccessCode
              .value,
            pineMerchantId: this.settingsForm.controls.pineMerchantId.value,
            merchantSecretKey: this.settingsForm.controls.merchantSecretKey
              .value
          },
          pgSettlementAccount: this.settingsForm.controls.pgSettlementAccount
            .value,
          upiEnabled: this.settingsForm.controls.upiEnabledCheckbox.value,
          escrowQrEnabled: this.settingsForm.controls.escrowQRCheckBox.value,
          vpaCount: parseInt(this.vpaCount),
          upiPayoutEnabled: this.settingsForm.value.upiPayoutEnabledCheckbox,
          mccCode: this.settingsForm.value.mccCode,
          accountDocumentMandatoryForAPI: this.settingsForm.value
            .accountDocumentMandatoryForAPI,
          rblPaymentType: this.rblPaymentType,
          ...payeeValidationUpdateData,
          connectedBanking: this.settingsForm.controls
            .connectedBankingCheckBox.value,
          isIDFCWhiteLabel: this.settingsForm.controls.idfcWhiteLabelCheckBox
            .value,
          isTransferNotificationDisabled: this.settingsForm.controls
            .transferNotificationCheckBox.value,
          isPayeeNotificationDisabled: this.settingsForm.controls
            .payeeNotificationCheckBox.value,
          isDepositNotificationDisabled: this.settingsForm.controls
            .depositNotificationCheckBox.value,
          isAccountNotificationDisabled: this.settingsForm.controls.accountNotificationCheckBox.value,
          sourceAccountValidation: this.settingsForm.controls
            .sourceAccountValidation.value,
          enableBalanceRefresh: this.settingsForm.controls
            .refreshBalanceCheckBox.value,
          idfcDealId: this.settingsForm.controls.idfcDealId.value,
          reportSectionEnabled: this.settingsForm.controls.reportSectionEnabled.value
        }
        : {};

    const webHookObj = {};
    // Assign Webhooks if filled
    if (this.settingsForm.controls.webHookAuthType.value) {
      Object.assign(webHookObj, {
        webHookAuthType: this.settingsForm.controls.webHookAuthType.value
      });
      if (this.settingsForm.controls.webHookAuthType.value === 'basic') {
        if (
          !this.settingsForm.controls.transferHookBasicAuthUser.value ||
          !this.settingsForm.controls.transferHookBasicAuthPass.value ||
          !this.settingsForm.controls.depositHookBasicAuthUser.value ||
          !this.settingsForm.controls.depositHookBasicAuthPass.value
        ) {
          this.toastBody = 'Please fill all Basic Auth values';
          this.toastHead = 'Failed';
          this.utilityService.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.cdr.detectChanges();
          return;
        } else {
          Object.assign(webHookObj, {
            transferHookBasicAuthUser: this.settingsForm.controls
              .transferHookBasicAuthUser.value
          });
          Object.assign(webHookObj, {
            transferHookBasicAuthPass: this.settingsForm.controls
              .transferHookBasicAuthPass.value
          });
          Object.assign(webHookObj, {
            depositHookBasicAuthUser: this.settingsForm.controls
              .depositHookBasicAuthUser.value
          });
          Object.assign(webHookObj, {
            depositHookBasicAuthPass: this.settingsForm.controls
              .depositHookBasicAuthPass.value
          });
        }
      }
    }
    if (this.settingsForm.controls.transferHookURL.value) {
      Object.assign(webHookObj, {
        transferHookURL: this.settingsForm.controls.transferHookURL.value
      });
    }
    if (this.settingsForm.controls.transferHookToken.value) {
      Object.assign(webHookObj, {
        transferHookToken: this.settingsForm.controls.transferHookToken.value
      });
    }
    if (this.settingsForm.controls.depositHookURL.value) {
      Object.assign(webHookObj, {
        depositHookURL: this.settingsForm.controls.depositHookURL.value
      });
    }
    if (this.settingsForm.controls.depositHookToken.value) {
      Object.assign(webHookObj, {
        depositHookToken: this.settingsForm.controls.depositHookToken.value
      });
    }
    if (
      this.settingsForm.controls.webhookEncryptionEnabled.value &&
      !this.settingsForm.controls.webhookEncryptionKey.value
    ) {
      this.toastBody = 'Please enter encryption key';
      this.toastHead = 'Failed';
      this.utilityService.showToast(this.toastHead, this.toastBody, {
        headerClasses: 'bg-danger text-white'
      });
      this.cdr.detectChanges();
      return;
    }

    Object.assign(webHookObj, {
      webhookEncryptionEnabled: this.settingsForm.controls
        .webhookEncryptionEnabled.value
    });

    if (this.settingsForm.controls.webhookEncryptionKey.value) {
      Object.assign(webHookObj, {
        webhookEncryptionKey: this.settingsForm.controls.webhookEncryptionKey
          .value
      });
    }

    if (this.settingsForm.controls.webhookEncryptionIv.value) {
      Object.assign(webHookObj, {
        webhookEncryptionIv: this.settingsForm.controls.webhookEncryptionIv
          .value
      });
    }

    if (Object.keys(webHookObj).length > 0) {
      Object.assign(formData, { webHook: webHookObj });
    }
    
    let  payeeAuthorizerSettingsObj = {
        enabled: this.settingsForm.controls.payeeAdditionWithTrusteeApproval.value,
        withOTP: this.settingsForm.controls.payeeAuthorizerWithOTP.value ? true : false

      }

    if (Object.keys(payeeAuthorizerSettingsObj).length > 0) {
      Object.assign(formData, { payeeAuthorizerSettings: payeeAuthorizerSettingsObj });
    }
    console.log(payeeAuthorizerSettingsObj);
    this.merchantService
      .updateProfileDetails(this.merchantId, this.accountId, formData)
      .subscribe(
        resp => {
          if (resp.success) {
            console.log(resp);
            this.toastBody =
              this.merchantId.length > 0
                ? 'Merchant settings updated successfully.'
                : 'Account settings updated successfully.';
            this.toastHead = 'Success';
            this.utilityService.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-success text-white'
            });
            this.cdr.detectChanges();
          }
        },
        (err: any) => {
          this._loading$.next(false);
          this.errors = err.error?.errors;
          this.toastHead = 'Failed';
          this.toastBody = 'Failed to update Merchant Settings';
          this.utilityService.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.cdr.detectChanges();
        }
      );
    this.cdr.detectChanges();
  }

  sendOTP() {
    if (
      !this.settingsForm.controls.connectedBankingCheckBox.value &&
      !this.settingsForm.controls.isAccAddCheckbox.value
    ) {
      this.toastHead = 'Failed';
      this.toastBody =
        'To Activate the merchant, Enable at least one of the following: Digital Escrow or Connected Banking';
      this.utilityService.showToast(this.toastHead, this.toastBody, {
        headerClasses: 'bg-danger text-white'
      });
      return;
    }
    // open OTP verification modal
    console.log('opening modal');
    const modalRef: NgbModalRef & {
      componentInstance: OtpModalComponent;
    } = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    // this.merchantName;
    modalRef.componentInstance.doClose = modalRef;
    modalRef.componentInstance.header = 'Activate Merchant';
    modalRef.componentInstance.merchantName = this.merchantName;
    modalRef.componentInstance.mobile = environment.superAdminMobile;
    modalRef.componentInstance.templateId =
      smsMsg91TemplateId.merchantActivateOtp;
    modalRef.componentInstance.passOtp.subscribe((otp: number) => {
      if (otp) {
        this.onActivate(otp.toString());
      } else {
        console.log('something went with modal');
      }
    });
  }

  onActivate(otp: string) {
    const formData = {
      email: this.merchantEmail,
      otp
    };

    this.merchantService.activateMerchant(this.merchantId, formData).subscribe(
      resp => {
        if (resp.success) {
          this.toastBody = resp.message?.includes(
            'Merchant authorization created'
          )
            ? 'Merchant Sent for Approval to Authorizers'
            : 'Merchant Activated and Password Generated';
          this.toastHead = 'Success';
          this.utilityService.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-success text-white'
          });
          this.activated = true;
          this.cdr.detectChanges();
        }
      },
      (err: any) => {
        this._loading$.next(false);
        this.errors = err.error.errors;
        this.toastHead = 'Failed';
        this.utilityService.showToast(this.toastHead, this.toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
      }
    );
  }

  hasBank(bankName: string) {
    return !!this.banks.filter((_bank: any) => _bank.bankName === bankName)
      .length;
  }

  copyToClipboard(xapiKey: string, toastBody: string) {
    this.isCopied = true;
    this.utilityService.copyToClipboard(xapiKey);
    this.toastBody = toastBody;
    this.toastHead = 'Success';
    this.utilityService.showToast(this.toastHead, this.toastBody, {
      headerClasses: 'bg-success text-white'
    });
    setTimeout(() => {
      this.isCopied = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  public async generateEncryptionKey(length: number) {
    this.profileService.generateEncryptionKey().subscribe(resp => {
      this.spinner.show();
      if (resp.success) {
        console.log(resp);
        this.settingsForm.controls.webhookEncryptionKey.setValue(resp.result);
        this.whKeyGenerated = true;
        this.whKeyHashed = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      }
    });
  }

  updateRadioBoxVal(value: string, event: any) {
    if (value === 'withOTP' && (event.target as HTMLInputElement).checked) {
      this.payeeAuthorizerWithOTP = true;
    } else if (value === 'withoutOTP' && (event.target as HTMLInputElement).checked) {
      this.payeeAuthorizerWithOTP = false;
    }

    this.cdr.detectChanges();
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { NgbCalendar, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { ProfileService } from '@modules/profile/services';
import { ThemePalette } from '@angular/material/core';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DBSAccountResponse } from '@modules/profile/models/dbsAccounts';
import accountType from '@modules/profile/constants/accountType';
// import { DBSAccountResponse } from '@modules/profile/models/dbsAccount';

@Component({
  selector: 'sbpro-dbs-hard-escrow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dbs-hard-escrow.component.pug',
  styleUrls: ['dbs-hard-escrow.component.scss']
})
export class DbsHardEscrowComponent implements OnInit {
  hardEscrowForm: FormGroup;
  errors: string[] = [];
  @Input() merchantId = '';
  @Input() accountData = {} as any;
  isEdit = false;
  submitting = false;
  color: ThemePalette = 'accent';
  checked = false;
  disabled = false;

  @Input() doClose?: NgbModalRef;

  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private toastService: ToastService,
    public activeModal: NgbActiveModal
  ) {
    this.hardEscrowForm = this.formBuilder.group({
      accountNo: [null, [Validators.required]],
      accountName: [null, [Validators.required]],
      swiftBIC: [null, [Validators.required]],
      accountType: [accountType.CURRENT],
      trusteeMail: [null],
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
      prefix: [null, [Validators.required]],
      organisationId: [null, [Validators.required]],
      keyId: [null, [Validators.required]],
      enableConnectedBanking: [false],
      enableConnectedBankingWithVA: [false],
      upiId: [null]
    });
  }

  //On Init
  ngOnInit() {
    if (Object.keys(this.accountData).length) {
      this.isEdit = true;
      this.hardEscrowForm.controls.accountNo.setValue(
        this.accountData.dbsAccountNo
      );
      this.hardEscrowForm.controls.accountName.setValue(
        this.accountData.dbsAccountName
      );
      this.hardEscrowForm.controls.trusteeMail.setValue(
        this.accountData.dbsTrusteeMail
      );
      this.hardEscrowForm.controls.ifsc.setValue(this.accountData.dbsIFSC);
      this.hardEscrowForm.controls.prefix.setValue(
        this.accountData.dbsPrefixCode
      );
      this.hardEscrowForm.controls.swiftBIC.setValue(
        this.accountData.dbsSwiftBIC
      );
      this.hardEscrowForm.controls.accountType.setValue(
        this.accountData.accountType
      );

      this.hardEscrowForm.controls.enableConnectedBanking.setValue(
        this.accountData.connectedBanking
      );

      this.hardEscrowForm.controls.enableConnectedBankingWithVA.setValue(
        this.accountData.enableConnectedBankingWithVA
      );

      this.hardEscrowForm.controls.organisationId.setValue(
        this.accountData.organisationId
      );

      this.hardEscrowForm.controls.keyId.setValue(this.accountData.keyId);
      this.hardEscrowForm.controls.upiId.setValue(this.accountData.upiId);
      if (this.accountData.accountType === 'current') {
        this.hardEscrowForm.controls.accountType.setValue(accountType.CURRENT);
      } else if (this.accountData.accountType === 'escrow') {
        this.hardEscrowForm.controls.accountType.setValue(accountType.Escrow);
      }
    }
    console.log(this.hardEscrowForm);
  }

  updateEnableConnectedBanking(value: boolean) {
    this.hardEscrowForm.patchValue({
      enableConnectedBankingWithVA: value
    });
  }

  /**
   * Check for
   * Invalid input
   * @param form
   */
  findInvalidControls(form: any) {
    const controls = form.controls;
    console.log(controls);
    for (const name in controls) {
      if (controls[name].invalid) {
        this.errors.push('Please enter a valid ' + name);
      }
    }
  }

  /**
   * On form
   * submit
   */
  onSubmit() {
    this.errors = [];
    if (!this.hardEscrowForm.valid) {
      this.findInvalidControls(this.hardEscrowForm);
      return;
    }

    this.submitting = true;
    let dbsAccountDetails = {
      dbsAccountNo: this.hardEscrowForm.controls.accountNo.value,
      dbsIfsc: this.hardEscrowForm.controls.ifsc.value,
      dbsModes: 'NEFT',
      dbsPayoutMethod: 'api',
      accountType: this.hardEscrowForm.controls.accountType.value,
      dbsMerchantId: this.merchantId,
      version: 'v1',
      trusteeEmails: this.hardEscrowForm.controls.trusteeMail.value,
      owner: 'merchant',
      dbsAccountName: this.hardEscrowForm.controls.accountName.value,
      contentKeyPrivate: '',
      passwordKeyPrivate: '',
      contentKeyPublic: '',
      connectedBanking: this.hardEscrowForm.controls.enableConnectedBanking
        .value,
      enableConnectedBankingWithVA: this.hardEscrowForm.controls
        .enableConnectedBankingWithVA.value,
      data: {
        prefixCode: this.hardEscrowForm.controls.prefix.value,
        swiftBic: this.hardEscrowForm.controls.swiftBIC.value,
        organisationId: this.hardEscrowForm.controls.organisationId.value,
        keyId: this.hardEscrowForm.controls.keyId.value,
        upiId:this.hardEscrowForm.controls.upiId.value
      }
    };

    if (this.isEdit) {
      this.profileService.updateDBSAccount(dbsAccountDetails).subscribe(
        (resp: DBSAccountResponse) => {
          console.log(resp);
          this.submitting = false;
          if (resp.success) {
            this.showToast('Success', 'Account updated successfully', {
              headerClasses: 'bg-success text-white'
            });
            this.activeModal.close(resp);
            this.closeModal(true);
          } else {
            this.errors = (resp as any).errors;
          }
        },
        (err: any) => {
          this.submitting = false;
          this.showToast('Failed', 'Failed to Add Account', {
            headerClasses: 'bg-danger text-white'
          });
          this.closeModal(false);
        }
      );
    } else {
      this.profileService.createDBSAccount(dbsAccountDetails).subscribe(
        (resp: DBSAccountResponse) => {
          console.log(resp);
          this.submitting = false;
          if (resp.success) {
            this.showToast('Success', 'Account updated successfully', {
              headerClasses: 'bg-success text-white'
            });
            this.activeModal.close(resp);
            this.closeModal(true);
          } else {
            this.errors = (resp as any).errors;
          }
        },
        err => {
          this.submitting = false;
          this.showToast('Failed', 'Failed to Add Account', {
            headerClasses: 'bg-danger text-white'
          });
          this.closeModal(false);
        }
      );
    }
  }

  /**
   * Show Notification
   * Toast
   * @param header
   * @param body
   * @param options
   */
  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 5000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }

  /**
   * Close Modal
   * @param modalValue
   */
  closeModal(modalValue: boolean) {
    this.doClose?.close(modalValue);
  }
}

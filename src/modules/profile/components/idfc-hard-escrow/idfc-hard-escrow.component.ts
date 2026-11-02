import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { NgbCalendar, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '@modules/profile/services';
import { ThemePalette } from '@angular/material/core';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IDFCAccountResponse } from '@modules/profile/models/idfcAccount';
import accountType from '@modules/profile/constants/accountType';

@Component({
  selector: 'sbpro-idfc-hard-escrow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './idfc-hard-escrow.component.pug',
  styleUrls: ['idfc-hard-escrow.component.scss']
})
export class IdfcHardEscrowComponent implements OnInit {
  hardEscrowForm: FormGroup;
  errors: string[] = [];
  @Input() merchantId = '';
  @Input() accountData = {} as any;
  isEdit = false;
  submitting = false;
  color: ThemePalette = 'accent';
  checked = false;
  disabled = false;
  hide = false;

  @Input() doClose?: NgbModalRef;

  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private toastService: ToastService,
    public activeModal: NgbActiveModal
  ) {
    this.hardEscrowForm = this.formBuilder.group({
      accountNo: [null, [Validators.required]],
      accountPOBOCode: [null],
      accountName: [null, [Validators.required]],
      clientCode: [null, [Validators.required]],
      h2hClientCode: [null],
      cryptoKey: [null],
      collectCryptoKey: [null],
      clientId: [null],
      clientSecret: [null],
      trusteeMail: [null],
      accountCode: [null, [Validators.required]],
      ifsc: [null],
      scope: [null],
      source: [null],
      kId: [null],
      enableConnectedBanking: [false, [Validators.required]],
      enableConnectedBankingWithVA: [false],
      accountType: [accountType.CURRENT],
      enableHighTPS: [false],
      description: [null]
    });
  }

  //On Init
  ngOnInit() {
    if (Object.keys(this.accountData).length) {
      if (this.accountData) {
        this.hide = true;
      }
      this.isEdit = true;
      this.hardEscrowForm.controls.accountNo.setValue(
        this.accountData.idfcAccountNo
      );
      this.hardEscrowForm.controls.accountName.setValue(
        this.accountData.idfcAccountName
      );
      this.hardEscrowForm.controls.clientCode.setValue(
        this.accountData.idfcClientCode
      );
      this.hardEscrowForm.controls.h2hClientCode.setValue(
        this.accountData.idfcH2HClientCode
      );
      this.hardEscrowForm.controls.clientId.setValue(
        this.accountData.idfcClientId
      );
      this.hardEscrowForm.controls.cryptoKey.setValue(
        this.accountData.idfcCryptoKey
      );
      this.hardEscrowForm.controls.collectCryptoKey.setValue(
        this.accountData.idfcCollectCryptoKey
      );
      this.hardEscrowForm.controls.clientSecret.setValue(
        this.accountData.idfcClientSecret
      );
      this.hardEscrowForm.controls.trusteeMail.setValue(
        this.accountData.idfcTrusteeMail
      );
      this.hardEscrowForm.controls.accountCode.setValue(
        this.accountData.idfcAccountCode
      );
      this.hardEscrowForm.controls.accountPOBOCode.setValue(
        this.accountData.idfcAccountPOBOCode
      );
      this.hardEscrowForm.controls.ifsc.setValue(this.accountData.idfcIFSC);
      this.hardEscrowForm.controls.scope.setValue(this.accountData.idfcScope);
      this.hardEscrowForm.controls.source.setValue(this.accountData.idfcSource);
      this.hardEscrowForm.controls.kId.setValue(this.accountData.idfcKId);
      this.hardEscrowForm.controls.enableConnectedBanking.setValue(
        this.accountData.connectedBanking
      );
      this.hardEscrowForm.controls.enableConnectedBankingWithVA.setValue(
        this.accountData.enableConnectedBankingWithVA
      );
      if (this.accountData.accountType === accountType.CURRENT) {
        this.hardEscrowForm.controls.accountType.setValue(accountType.CURRENT);
      } else if (this.accountData.accountType === accountType.Escrow) {
        this.hardEscrowForm.controls.accountType.setValue(accountType.Escrow);
      }

      this.hardEscrowForm.controls.enableHighTPS.setValue(
        this.accountData.highTPS
      );

      if (this.accountData.idfcDescription) {
        this.hardEscrowForm.controls.description.setValue(
          this.accountData.idfcDescription
        );
      }
    }
    console.log(this.hardEscrowForm);
    console.log(this.hide);
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

  updateEnableConnectedBanking(value: boolean) {
    this.hardEscrowForm.patchValue({
      enableConnectedBankingWithVA: value
    });
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
    let idfcAccountDetails = {
      idfcMerchantId: this.merchantId,
      idfcAccountNo: this.hardEscrowForm.controls.accountNo.value,
      idfcAccountName: this.hardEscrowForm.controls.accountName.value,
      idfcClientCode: this.hardEscrowForm.controls.clientCode.value,
      idfcH2HClientCode: this.hardEscrowForm.controls.h2hClientCode.value,
      idfcCryptoKey: this.hardEscrowForm.controls.cryptoKey.value,
      idfcCollectCryptoKey: this.hardEscrowForm.controls.collectCryptoKey.value,
      idfcClientId: this.hardEscrowForm.controls.clientId.value,
      idfcClientSecret: this.hardEscrowForm.controls.clientSecret.value,
      idfcTrusteeMail: this.hardEscrowForm.controls.trusteeMail.value,
      idfcAccountCode: this.hardEscrowForm.controls.accountCode.value,
      idfcAccountPOBOCode: this.hardEscrowForm.controls.accountPOBOCode.value,
      idfcIFSC: this.hardEscrowForm.controls.ifsc.value,
      idfcKId: this.hardEscrowForm.controls.kId.value,
      idfcScope: this.hardEscrowForm.controls.scope.value,
      idfcSource: this.hardEscrowForm.controls.source.value,
      enterpriseVersion: 'v1',
      connectedBanking: this.hardEscrowForm.controls.enableConnectedBanking
        .value,
      enableConnectedBankingWithVA: this.hardEscrowForm.controls
        .enableConnectedBankingWithVA.value,
      accountType: this.hardEscrowForm.controls.accountType.value,
      highTPS: this.hardEscrowForm.controls.enableHighTPS.value,
      idfcDescription: this.hardEscrowForm.controls.description.value
    };

    if (this.isEdit) {
      this.profileService.updateIDFCAccount(idfcAccountDetails).subscribe(
        (resp: IDFCAccountResponse) => {
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
      this.profileService.createIDFCAccount(idfcAccountDetails).subscribe(
        (resp: IDFCAccountResponse) => {
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

  highTPS(event: any) {
    if ((event.target as HTMLInputElement).checked) {
      this.showToast(
        'Success',
        'Transfer will bypass trustee and admin approval flow and will directly go to bank for processing',
        { headerClasses: 'bg-success text-white' }
      );
    }
  }
}

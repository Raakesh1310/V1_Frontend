import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '@modules/profile/services';
import { ThemePalette } from '@angular/material/core';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AxisAccountResponse } from '@modules/profile/models/axisAccounts';
import axisPayoutTypes from '@modules/profile/constants/axisPayoutTypes';
import axisPayoutModes from '@modules/profile/constants/axisPayoutModes';
import axisProjectVersion from '@modules/profile/constants/axisProjectVersion';

@Component({
  selector: 'sbpro-axis-hard-escrow',
  templateUrl: './axis-hard-escrow.component.pug',
  styleUrls: ['./axis-hard-escrow.component.scss']
})
export class AxisHardEscrowComponent implements OnInit {
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
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef
  ) {
    this.hardEscrowForm = this.formBuilder.group({
      accountNo: [null, [Validators.required]],
      accountName: [null, [Validators.required]],
      clientId: [null, [Validators.required]],
      clientSecret: [null, [Validators.required]],
      corpCode: [null, [Validators.required]],
      channelId: [null, [Validators.required]],
      prefixCode: [null, [Validators.required]],
      emailId: [null, [Validators.required]],
      userId: [null, [Validators.required]],
      secretKey: [null, [Validators.required]],
      pan: [null, [Validators.required]],
      address: [null, [Validators.required]],
      trusteeMail: [null, [Validators.required]],
      enableConnectedBanking: [false],
      ifsc: [null, [Validators.required]],
      enableConnectedBankingWithVA: [false],
      accountType: ['current']
    });
  }

  //On Init
  ngOnInit() {
    if (Object.keys(this.accountData).length) {
      this.isEdit = true;
      this.hardEscrowForm.controls.accountNo.setValue(
        this.accountData.accountNo
      );
      this.hardEscrowForm.controls.accountName.setValue(
        this.accountData.holderName
      );
      this.hardEscrowForm.controls.clientId.setValue(
        this.accountData.data.clientId
      );
      this.hardEscrowForm.controls.clientSecret.setValue(
        this.accountData.data.clientSecret
      );
      this.hardEscrowForm.controls.corpCode.setValue(
        this.accountData.data.corpCode
      );
      this.hardEscrowForm.controls.channelId.setValue(
        this.accountData.data.channelId
      );
      this.hardEscrowForm.controls.emailId.setValue(
        this.accountData.data.emailId
      );
      this.hardEscrowForm.controls.pan.setValue(
        this.accountData.data.panNumber
      );
      this.hardEscrowForm.controls.address.setValue(
        this.accountData.data.address
      );
      this.hardEscrowForm.controls.enableConnectedBankingWithVA.setValue(
        this.accountData.allowChildAccount
      );
      this.hardEscrowForm.controls.enableConnectedBanking.setValue(
        this.accountData.connectedBanking
      );
      this.hardEscrowForm.controls.accountType.setValue(this.accountData.type);
      this.hardEscrowForm.controls.secretKey.setValue(
        this.accountData.data.secretKey
      );
      this.hardEscrowForm.controls.trusteeMail.setValue(
        this.accountData.trusteeEmails
      );
      this.hardEscrowForm.controls.userId.setValue(
        this.accountData.data.userId
      );
      this.hardEscrowForm.controls.accountType.setValue(this.accountData.type);
      this.hardEscrowForm.controls.ifsc.setValue(this.accountData.ifsc);
      this.hardEscrowForm.controls.prefixCode.setValue(
        this.accountData.data.prefixCode
      );
    }
    console.log(this.hardEscrowForm);
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

    this.submitting = true;

    let axisAccountDetails = {
      merchantId: this.merchantId,
      id: this.hardEscrowForm.controls.accountNo.value,
      holderName: this.hardEscrowForm.controls.accountName.value,
      ifsc: this.hardEscrowForm.controls.ifsc.value,
      data: {
        prefixCode: this.hardEscrowForm.controls.prefixCode.value,
        corpCode: this.hardEscrowForm.controls.corpCode.value,
        channelId: this.hardEscrowForm.controls.channelId.value,
        emailId: this.hardEscrowForm.controls.emailId.value,
        userId: this.hardEscrowForm.controls.userId.value,
        clientId: this.hardEscrowForm.controls.clientId.value,
        clientSecret: this.hardEscrowForm.controls.clientSecret.value,
        secretKey: this.hardEscrowForm.controls.secretKey.value,
        panNumber: this.hardEscrowForm.controls.pan.value,
        address: this.hardEscrowForm.controls.address.value
      },
      owner: 'merchant',
      allowChildAccount: this.hardEscrowForm.controls
        .enableConnectedBankingWithVA.value,
      connectedBanking: this.hardEscrowForm.controls.enableConnectedBanking
        .value,
      modes: [
        axisPayoutTypes.RTGS,
        axisPayoutTypes.NEFT,
        axisPayoutTypes.IMPS,
        axisPayoutTypes.FT
      ],
      payoutMethod: axisPayoutModes.API,
      type: this.hardEscrowForm.controls.accountType.value,
      version: axisProjectVersion.V1,
      trusteeEmails:
        typeof this.hardEscrowForm.controls.trusteeMail.value === 'string'
          ? this.hardEscrowForm.controls.trusteeMail.value.split(',')
          : this.hardEscrowForm.controls.trusteeMail.value
    };

    if (this.isEdit) {
      this.profileService
        .updateAxisAccount(axisAccountDetails.id, {
          data: axisAccountDetails.data,
          trusteeEmails:
            typeof this.hardEscrowForm.controls.trusteeMail.value === 'string'
              ? this.hardEscrowForm.controls.trusteeMail.value.split(',')
              : this.hardEscrowForm.controls.trusteeMail.value,
          modes: axisAccountDetails.modes
        })
        .subscribe(
          (resp: AxisAccountResponse) => {
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
            this.showToast(
              'Failed',
              err.error.errors[0] || 'Failed to Add Account',
              {
                headerClasses: 'bg-danger text-white'
              }
            );
            this.errors = err.error.errors;
            this.cdr.detectChanges();
          }
        );
    } else {
      this.profileService.createAxisAccount(axisAccountDetails).subscribe(
        (resp: AxisAccountResponse) => {
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
          this.showToast(
            'Failed',
            err.error.errors[0] || 'Failed to Add Account',
            {
              headerClasses: 'bg-danger text-white'
            }
          );
          this.errors = err.error.errors;
          this.cdr.detectChanges();
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

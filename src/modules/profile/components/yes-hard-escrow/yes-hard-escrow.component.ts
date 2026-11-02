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
import { YesAccountResponse } from '@modules/profile/models/yesAccount';
import accountType from '@modules/profile/constants/accountType';

@Component({
  selector: 'sbpro-yes-hard-escrow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './yes-hard-escrow.component.pug',
  styleUrls: ['yes-hard-escrow.component.scss']
})
export class YesHardEscrowComponent implements OnInit {
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
      accountName: [null, [Validators.required]],
      appId: [null, [Validators.required]],
      secondId: [null, [Validators.required]],
      clientId: [null, [Validators.required]],
      clientSecret: [null, [Validators.required]],
      trusteeMail: [null],
      ifsc: [null],
      enableConnectedBanking: [false, [Validators.required]],
      enableConnectedBankingWithVA: [false],
      accountType: [accountType.CURRENT],
      enableHighTPS: [false]
    });
  }
  //On Init
  ngOnInit(): void {
    if (Object.keys(this.accountData).length) {
      if (this.accountData) {
        this.hide = true;
      }
      this.isEdit = true;
      this.hardEscrowForm.controls.accountNo.setValue(
        this.accountData.yesAccountNo
      );
      this.hardEscrowForm.controls.accountName.setValue(
        this.accountData.yesAccountName
      );
      this.hardEscrowForm.controls.appId.setValue(this.accountData.yesAppId);
      this.hardEscrowForm.controls.secondId.setValue(
        this.accountData.yesSecondId
      );
      this.hardEscrowForm.controls.clientId.setValue(
        this.accountData.yesClientId
      );
      this.hardEscrowForm.controls.clientSecret.setValue(
        this.accountData.yesClientSecret
      );
      this.hardEscrowForm.controls.trusteeMail.setValue(
        this.accountData.yesTrusteeMail
      );
      this.hardEscrowForm.controls.ifsc.setValue(this.accountData.yesIFSC);
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
    let yesAccountDetails = {
      yesMerchantId: this.merchantId,
      yesAccountNo: this.hardEscrowForm.controls.accountNo.value,
      yesAccountName: this.hardEscrowForm.controls.accountName.value,
      yesAppId: this.hardEscrowForm.controls.appId.value,
      yesSecondId: this.hardEscrowForm.controls.secondId.value,
      yesClientId: this.hardEscrowForm.controls.clientId.value,
      yesClientSecret: this.hardEscrowForm.controls.clientSecret.value,
      yesTrusteeMail: this.hardEscrowForm.controls.trusteeMail.value,
      yesIFSC: this.hardEscrowForm.controls.ifsc.value,
      connectedBanking: this.hardEscrowForm.controls.enableConnectedBanking
        .value,
      accountType: this.hardEscrowForm.controls.accountType.value,
      enableConnectedBankingWithVA: this.hardEscrowForm.controls
        .enableConnectedBankingWithVA.value,
      highTPS: this.hardEscrowForm.controls.enableHighTPS.value
    };

    if (this.isEdit) {
      this.profileService.updateYesAccount(yesAccountDetails).subscribe(
        (resp: YesAccountResponse) => {
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
      this.profileService.createYesAccount(yesAccountDetails).subscribe(
        (resp: YesAccountResponse) => {
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

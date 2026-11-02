import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
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
import { ICICIAccountResponse } from '@modules/profile/models/iciciAccount';
import accountType from '@modules/profile/constants/accountType';
import ifscRegexpt from '@modules/profile/constants/ifscRegexpt';

@Component({
  selector: 'sbpro-icici-hard-escrow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icici-hard-escrow.component.pug',
  styleUrls: ['icici-hard-escrow.component.scss']
})
export class IciciHardEscrowComponent implements OnInit {
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
      sftpUploadPath: [null, [Validators.required]],
      sftpReportPath: [null, [Validators.required]],
      accountPrefix: [null, [Validators.required]],
      accountNo: [null, [Validators.required]],
      accountName: [null, [Validators.required]],
      trusteeMail: [null],
      clientCode: [null, [Validators.required]],
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
            if (!RegExp(ifscRegexpt.IFSC_REG_EXP).test(val.value)) {
              return { Error: `Ifsc is invalid.` };
            }
          }
        ]
      ],
      uploadFilename: [null, [Validators.required]],
      aggregatorName: [null, [Validators.required]],
      aggregatorId: [null, [Validators.required]],
      corpId: [null, [Validators.required]],
      userId: [null, [Validators.required]],
      enableConnectedBanking: [false, [Validators.required]],
      enableConnectedBankingWithVA: [false],
      accountType: [accountType.CURRENT]
    });
  }
  //On Init
  ngOnInit(): void {
    if (Object.keys(this.accountData).length) {
      this.isEdit = true;
      this.hardEscrowForm.controls.sftpUploadPath.setValue(
        this.accountData.sftpUploadPath
      );
      this.hardEscrowForm.controls.sftpReportPath.setValue(
        this.accountData.sftpReportPath
      );
      this.hardEscrowForm.controls.accountPrefix.setValue(
        this.accountData.accountPrefix
      );
      this.hardEscrowForm.controls.accountNo.setValue(
        this.accountData.accountNo
      );
      this.hardEscrowForm.controls.accountName.setValue(
        this.accountData.accountName
      );
      this.hardEscrowForm.controls.aggregatorName.setValue(
        this.accountData.aggregatorName
      );
      this.hardEscrowForm.controls.aggregatorId.setValue(
        this.accountData.aggregatorId
      );
      this.hardEscrowForm.controls.corpId.setValue(this.accountData.corpId);
      this.hardEscrowForm.controls.trusteeMail.setValue(
        this.accountData.trusteeMail
      );

      this.hardEscrowForm.controls.userId.setValue(this.accountData.userId);

      this.hardEscrowForm.controls.ifsc.setValue(this.accountData.ifsc);
      this.hardEscrowForm.controls.clientCode.setValue(
        this.accountData.clientCode
      );
      this.hardEscrowForm.controls.uploadFilename.setValue(
        this.accountData.uploadFilename
      );

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
    if (!this.hardEscrowForm.valid) {
      this.findInvalidControls(this.hardEscrowForm);
      return;
    }

    this.submitting = true;
    let accountDetails = {
      merchantId: this.merchantId,
      accountPrefix: this.hardEscrowForm.controls.accountPrefix.value,
      sftpUploadPath: this.hardEscrowForm.controls.sftpUploadPath.value,
      sftpReportPath: this.hardEscrowForm.controls.sftpReportPath.value,
      accountNo: this.hardEscrowForm.controls.accountNo.value,
      accountName: this.hardEscrowForm.controls.accountName.value,
      ifsc: this.hardEscrowForm.controls.ifsc.value,
      clientCode: this.hardEscrowForm.controls.clientCode.value,
      uploadFilename: this.hardEscrowForm.controls.uploadFilename.value,
      trusteeMail: this.hardEscrowForm.controls.trusteeMail.value,
      enterpriseVersion: 'v1',
      aggregatorName: this.hardEscrowForm.controls.aggregatorName.value,
      aggregatorId: this.hardEscrowForm.controls.aggregatorId.value,
      corpId: this.hardEscrowForm.controls.corpId.value,
      userId: this.hardEscrowForm.controls.userId.value,
      connectedBanking: this.hardEscrowForm.controls.enableConnectedBanking
        .value,
      enableConnectedBankingWithVA: this.hardEscrowForm.controls
        .enableConnectedBankingWithVA.value,
      accountType: this.hardEscrowForm.controls.accountType.value
    };

    if (this.isEdit) {
      this.profileService.updateICICIAccount(accountDetails).subscribe(
        (resp: ICICIAccountResponse) => {
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
      this.profileService.createICICIAccount(accountDetails).subscribe(
        (resp: ICICIAccountResponse) => {
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

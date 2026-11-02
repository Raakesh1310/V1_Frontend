import { NgbCalendar, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '@modules/profile/services';
import { ThemePalette } from '@angular/material/core';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  RBLAccountResponse,
  RBLAccountResult
} from '@modules/profile/models/rblAccount';
import accountType from '@modules/profile/constants/accountType';

@Component({
  selector: 'sbpro-rbl-hard-escrow',
  templateUrl: './rbl-hard-escrow.component.pug',
  styleUrls: ['./rbl-hard-escrow.component.scss']
})
export class RblHardEscrowComponent implements OnInit {
  hardEscrowForm: FormGroup;
  errors: string[] = [];
  @Input() merchantId = '';
  @Input() accountData = {} as RBLAccountResult;
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
      corpID: [null, [Validators.required]],
      makerID: [null, [Validators.required]],
      checkerID: [null, [Validators.required]],
      approverID: [null, [Validators.required]],
      ldapUser: [null, [Validators.required]],
      ldapPassword: [null, [Validators.required]],
      clientID: [null, [Validators.required]],
      clientSecret: [null, [Validators.required]],
      cifID: [null],
      accountClientId: [null],
      sftpFolderName: [null],
      sftpUser: [null],
      sftpPassword: [null],
      trusteeMail: [null],
      enableConnectedBanking: [false],
      ifsc: [null],
      upiId: [null],
      upiHostname: [null],
      upiDecriptionKey: [null],
      upiUserName: [null],
      upiPassword: [null],
      upiBCAgent: [null],
      upiHMAC: [null],
      upiMrchOrgId: [null],
      upiAggrorgId: [null],
      enableConnectedBankingWithVA: [false],
      accountType: [accountType.CURRENT],
      enableHighTPS: [false]
    });
  }

  ngOnInit(): void {
    if (Object.keys(this.accountData).length) {
      this.isEdit = true;
      this.hardEscrowForm.controls.accountNo.setValue(
        this.accountData.rblAccountNo
      );
      this.hardEscrowForm.controls.accountName.setValue(
        this.accountData.rblAccountName
      );
      this.hardEscrowForm.controls.corpID.setValue(this.accountData.rblCorpId);
      this.hardEscrowForm.controls.makerID.setValue(
        this.accountData.rblMakerId
      );
      this.hardEscrowForm.controls.checkerID.setValue(
        this.accountData.rblCheckerId
      );
      this.hardEscrowForm.controls.approverID.setValue(
        this.accountData.rblApproverId
      );
      this.hardEscrowForm.controls.ldapUser.setValue(
        this.accountData.rblLDAPUser
      );
      this.hardEscrowForm.controls.ldapPassword.setValue(
        this.accountData.rblLDAPPassword
      );
      this.hardEscrowForm.controls.clientID.setValue(
        this.accountData.rblClientId
      );
      this.hardEscrowForm.controls.clientSecret.setValue(
        this.accountData.rblClientSecret
      );
      this.hardEscrowForm.controls.cifID.setValue(this.accountData.rblCifId);
      this.hardEscrowForm.controls.accountClientId.setValue(
        this.accountData.rblAccountClientId
      );
      this.hardEscrowForm.controls.sftpFolderName.setValue(
        this.accountData.rblSFTPFolderName
      );
      this.hardEscrowForm.controls.sftpUser.setValue(
        this.accountData.rblSFTPUser
      );
      this.hardEscrowForm.controls.sftpPassword.setValue(
        this.accountData.rblSFTPPassword
      );
      this.hardEscrowForm.controls.trusteeMail.setValue(
        this.accountData.rblTrusteeMail
      );
      this.hardEscrowForm.controls.enableConnectedBanking.setValue(
        this.accountData.connectedBanking
      );
      this.hardEscrowForm.controls.enableConnectedBankingWithVA.setValue(
        this.accountData.enableConnectedBankingWithVA
      );
      this.hardEscrowForm.controls.ifsc.setValue(this.accountData.rblIFSC);
      this.hardEscrowForm.controls.upiId.setValue(this.accountData.upiId);
      this.hardEscrowForm.controls.upiHostname.setValue(
        this.accountData.upiHostname
      );
      this.hardEscrowForm.controls.upiDecriptionKey.setValue(
        this.accountData.upiDecriptionKey
      );
      this.hardEscrowForm.controls.upiUserName.setValue(
        this.accountData.upiUserName
      );
      this.hardEscrowForm.controls.upiPassword.setValue(
        this.accountData.upiPassword
      );
      this.hardEscrowForm.controls.upiBCAgent.setValue(
        this.accountData.upiBCAgent
      );
      this.hardEscrowForm.controls.upiHMAC.setValue(this.accountData.upiHMAC);
      this.hardEscrowForm.controls.upiMrchOrgId.setValue(
        this.accountData.upiMrchOrgId
      );
      this.hardEscrowForm.controls.upiAggrorgId.setValue(
        this.accountData.upiAggrorgId
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
  }

  updateEnableConnectedBanking(value: boolean) {
    this.hardEscrowForm.patchValue({
      enableConnectedBankingWithVA: value
    });
  }
  /**
   * Update Checkbox
   * Value
   * @param formControlName
   * @param event
   */
  updateCheckBoxVal(formControlName: string, event: Event) {
    this.hardEscrowForm.controls[formControlName].patchValue(
      (event.target as HTMLInputElement).checked
    );
  }

  /**
   * Check for
   * Invalid input
   * @param form
   */
  findInvalidControls(form: any) {
    const controls = form.controls;
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
    let rblAccountDetails = {
      rblMerchantId: this.merchantId,
      rblCorpId: this.hardEscrowForm.controls.corpID.value,
      rblMakerId: this.hardEscrowForm.controls.makerID.value,
      rblCheckerId: this.hardEscrowForm.controls.checkerID.value,
      rblApproverId: this.hardEscrowForm.controls.approverID.value,
      rblAccountNo: this.hardEscrowForm.controls.accountNo.value,
      rblAccountClientId: this.hardEscrowForm.controls.accountClientId.value,
      rblAccountName: this.hardEscrowForm.controls.accountName.value,
      rblLDAPUser: this.hardEscrowForm.controls.ldapUser.value,
      rblLDAPPassword: this.hardEscrowForm.controls.ldapPassword.value,
      rblClientId: this.hardEscrowForm.controls.clientID.value,
      rblClientSecret: this.hardEscrowForm.controls.clientSecret.value,
      rblCifId: this.hardEscrowForm.controls.cifID.value,
      rblSFTPFolderName: this.hardEscrowForm.controls.sftpFolderName.value,
      rblSFTPUser: this.hardEscrowForm.controls.sftpUser.value,
      rblSFTPPassword: this.hardEscrowForm.controls.sftpPassword.value,
      rblTrusteeMail: this.hardEscrowForm.controls.trusteeMail.value,
      connectedBanking: this.hardEscrowForm.controls.enableConnectedBanking
        .value,
      rblIFSC: this.hardEscrowForm.controls.ifsc.value,
      upiId: this.hardEscrowForm.controls.upiId.value,
      upiHostname: this.hardEscrowForm.controls.upiHostname.value,
      upiDecriptionKey: this.hardEscrowForm.controls.upiDecriptionKey.value,
      upiUserName: this.hardEscrowForm.controls.upiUserName.value,
      upiPassword: this.hardEscrowForm.controls.upiPassword.value,
      upiBCAgent: this.hardEscrowForm.controls.upiBCAgent.value,
      upiHMAC: this.hardEscrowForm.controls.upiHMAC.value,
      upiMrchOrgId: this.hardEscrowForm.controls.upiMrchOrgId.value,
      upiAggrorgId: this.hardEscrowForm.controls.upiAggrorgId.value,
      enableConnectedBankingWithVA: this.hardEscrowForm.controls
        .enableConnectedBankingWithVA.value,
      accountType: this.hardEscrowForm.controls.accountType.value,
      highTPS: this.hardEscrowForm.controls.enableHighTPS.value
    };

    if (this.isEdit) {
      this.profileService.updateRBLAccount(rblAccountDetails).subscribe(
        (resp: RBLAccountResponse) => {
          console.log(resp);
          this.submitting = false;
          if (resp.success) {
            this.showToast('Success', 'Account updated successfully', {
              headerClasses: 'bg-success text-white'
            });
            this.activeModal.close();
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
      this.profileService.createRBLAccount(rblAccountDetails).subscribe(
        (resp: RBLAccountResponse) => {
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

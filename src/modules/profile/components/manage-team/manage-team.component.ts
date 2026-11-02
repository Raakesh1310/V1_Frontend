import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {
  MerchantUserTeamMember,
  MerchantUser
} from '@modules/auth/models/merchantUser.model';
import { AuthService } from '@modules/auth/services';
import { TeamResponseModel } from '@modules/profile/models/manage-team';
import { ProfileService } from '@modules/profile/services';
import { AccountsService } from '@modules/accounts/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import merchantUserRoles from 'config/merchantUserRoles';
import { PayeeService } from '@modules/payee/services';
import _ from 'lodash';
import { Observable } from 'rxjs';
import { Account } from '@modules/accounts/models';
import { AccountsResponseModel } from '@modules/accounts/models/accounts-response.model';
import { BankAccountService } from '@modules/bank-account/services';
import { environment } from 'environments/environment';

@Component({
  selector: 'sbpro-manage-team',
  templateUrl: './manage-team.component.pug',
  styleUrls: ['./manage-team.component.scss']
})
export class ManageTeamComponent implements OnInit {
  accounts: Account[] = [];
  invites: Array<MerchantUser> = [];
  members: Array<MerchantUser> = [];
  inputs = '';
  roles = ['Admin', 'Finance', 'Payee', 'Custom'];
  selectedRole = '';
  selectedEmail = '';
  selectedFName = '';
  selectedLName = '';
  selectedPhone = '';
  roleName = '';
  selectedToolTipData!: MerchantUser;
  merchantProfile: any;
  //tslint:disable-next-line:no-any
  access: any = {};
  features = {
    createAccount: false,
    accountList: false,
    addPayee: false,
    payeeList: false,
    singleTransfer: false,
    bulkTransfer: false,
    myPassbook: false
    // escrowQr: false,
    // escrowPages: false,
    // challans: false
  };

  featuresConnectedBanking = {
    bankAccounts: false,
    addPayee: false,
    payeeList: false,
    singleTransfer: false,
    bulkTransfer: false,
    bankAccountTransfer: false,
    depositList: false
  };
  otherFeatures = {
    addPayee: false,
    payeeList: false
  };
  errors: string[] = [];
  filteredRoles: string[] = [];
  //tslint:disable-next-line:no-any
  modalRef: any;
  updateModal = false;
  resendModal = false;
  inviteProcessing = false;
  inviteProcessingErrors: string[] = [];
  @Input() merchantId!: string;
  @Input() readOnly = false;

  dropdownListEscrows = [{ id: '', itemName: '' }];
  dropdownListBankAccounts = [{ id: '', itemName: '' }];
  selectedItems = [];
  selectedBankAccounts = [];
  dropdownSettingsEscrows = {};
  dropdownSettingsBankAccounts = {};
  bankAccounts: any = [];
  hardEscrowNumbers: string[] = [];
  allAccountsSelected = false;
  allBankAccountSelected = false;
  isAdmin = false;
  escrowMandatory: boolean = false;
  selectAllItemsCheckBox: boolean = false;
  selectAllConnectedBanking: boolean = false;
  disableAddEscrow: boolean = true;
  disableInvite: boolean = false;

  constructor(
    public payeeService: PayeeService,
    private modalService: NgbModal,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private accountsService: AccountsService,
    private _location: Location,
    private bankAccountService: BankAccountService
  ) {
    this.merchantProfile = this.authService.getMerchantProfile();
    this.isAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit(): void {
    this.profileService.merchantId = this.merchantId;

    this.loadInvites();
    this.loadMembers();
    if (this.isAdmin) {
      if (
        !environment.adminEmail
          .split(',')
          .map(email => email.trim())
          .includes(this.authService.getEmail() as string)
      ) {
        this.disableInvite = true;
      }
      this.profileService.getProfile(this.merchantId, false).subscribe(resp => {
        this.merchantProfile = resp.result;
        if (
          this.merchantProfile?.isAccountAddAllowed &&
          !this.merchantProfile.connectedBanking
        ) {
          this.loadAccounts();
        }
        if (this.merchantProfile?.connectedBanking) {
          const index = this.roles.indexOf('Payee');
          this.roles.splice(index, 1);
          this.loadBankAccounts();
        }
      });
    }

    if (!this.isAdmin) {
      if (
        this.merchantProfile?.isAccountAddAllowed &&
        !this.merchantProfile.connectedBanking
      ) {
        this.loadAccounts();
      }
      if (this.merchantProfile?.connectedBanking) {
        const index = this.roles.indexOf('Payee');
        this.roles.splice(index, 1);
        this.loadBankAccounts();
      }
    }

    this.dropdownSettingsEscrows = {
      singleSelection: false,
      text: 'Select Escrow',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: 'myclass custom-class',
      badgeShowLimit: 3
    };

    this.dropdownSettingsBankAccounts = {
      singleSelection: false,
      text: 'Select Bank Accounts',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: 'myclass custom-class',
      badgeShowLimit: 3
    };
    this.cdr.detectChanges();
  }

  onBlur() {
    console.log('Final Bank Accounts', this.selectedBankAccounts);
    this.escrowMandatory = this.selectedBankAccounts.some(
      (bankAccounts: any) => {
        let bankAccountNo = this.bankAccounts.find(
          (account: any) => account.bankAccountNo === bankAccounts.id
        );
        return bankAccountNo && bankAccountNo.enableConnectedBankingWithVA;
      }
    );
    if (!this.escrowMandatory) {
      this.features = _.mapValues(this.features, () => false);
    }
    this.hardEscrowNumbers = this.selectedBankAccounts.map(
      (bankAccounts: any) => bankAccounts.id
    );
    this.loadAccounts();
    this.cdr.detectChanges();
  }

  onItemSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
    console.log(this.selectedBankAccounts);
    if (
      this.selectedItems.length > 0 &&
      this.selectedItems.length === this.accounts.length &&
      this.disableAddEscrow
    ) {
      this.disableAddEscrow = false;
    }
    this.cdr.detectChanges();
  }
  OnItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
    if (
      this.merchantProfile.connectedBanking &&
      this.merchantProfile.isAccountAddAllowed
    ) {
      this.onBlur();
    }
    if (
      this.selectedItems.length !== this.accounts.length &&
      !this.disableAddEscrow
    ) {
      this.features.createAccount = false;
      this.disableAddEscrow = true;
    }
    this.cdr.detectChanges();
  }
  onSelectAll(items: any) {
    console.log(items);
    if (
      this.selectedItems.length > 0 &&
      this.selectedItems.length === this.accounts.length &&
      this.disableAddEscrow
    ) {
      this.disableAddEscrow = false;
    }
    this.cdr.detectChanges();
  }
  onDeSelectAll(items: any) {
    if (
      this.merchantProfile.connectedBanking &&
      this.merchantProfile.isAccountAddAllowed
    ) {
      this.onBlur();
    }
    console.log(items);
    if (
      this.selectedItems.length !== this.accounts.length &&
      !this.disableAddEscrow
    ) {
      this.features.createAccount = false;
      this.disableAddEscrow = true;
    }
    this.cdr.detectChanges();
  }

  //for connected banking bank accounts
  loadBankAccounts() {
    if (!this.merchantId) {
      this.bankAccountService
        .retrieveBankAccounts(false, this.merchantId, {})
        .subscribe((resp: any) => {
          console.log(resp);
          if (resp) {
            this.bankAccounts = resp;
            this.dropdownListBankAccounts = this.mapAccounts(this.bankAccounts);
            this.cdr.detectChanges();
          }
        });
      return;
    }

    this.bankAccountService
      .retrieveBankAccounts(true, this.merchantId, {})
      .subscribe((resp: any) => {
        console.log(resp);
        if (resp) {
          this.bankAccounts = resp;
          this.dropdownListBankAccounts = this.mapAccounts(this.bankAccounts);
          this.cdr.detectChanges();
        }
      });
  }

  loadAccounts() {
    if (!this.merchantId) {
      this.accountsService
        .getAccounts(null, -1, {
          hardEscrowAccountNumber: this.hardEscrowNumbers
        })
        .subscribe((resp: AccountsResponseModel) => {
          console.log(resp);
          if (resp.success) {
            this.accounts = resp.result;
            console.log(resp.result);
            this.dropdownListEscrows = this.mapAccounts(this.accounts);
            this.cdr.detectChanges();
          }
        });
      return;
    }
    this.accountsService
      .getAccounts(this.merchantId, -1, {
        hardEscrowAccountNumber: this.hardEscrowNumbers
      })
      .subscribe((resp: AccountsResponseModel) => {
        console.log(resp);
        if (resp.success) {
          this.accounts = resp.result;
          this.dropdownListEscrows = this.mapAccounts(this.accounts);
          this.cdr.detectChanges();
        }
      });
  }

  mapAccounts(accounts: any) {
    let itemsList = [];
    if (!accounts[0]?.bankAccountNo) {
      for (let account of accounts) {
        itemsList.push({
          id: account.accountId,
          itemName: account.name + ' (' + account.accountId + ')'
        });
      }
    } else {
      for (let account of accounts) {
        itemsList.push({
          id: account.bankAccountNo,
          itemName: account.accountName + ' (' + account.bankAccountNo + ')'
        });
      }
    }

    return itemsList;
  }

  // invite functions

  loadInvites() {
    if (!this.merchantId) {
      this.profileService
        .getInvites(null)
        .subscribe((resp: TeamResponseModel) => {
          if (resp.success) {
            this.invites = resp.result;
            this.selectedEmail = '';
            this.selectedRole = '';
            this.cdr.detectChanges();
            console.log('RESPONSE FROM LOAD INVITES ', resp);
          }
        });
      return;
    }
    this.profileService
      .getInvites(this.merchantId)
      .subscribe((resp: TeamResponseModel) => {
        console.log(resp);
        if (resp.success) {
          this.invites = resp.result;
          this.selectedEmail = '';
          this.selectedRole = '';
          this.cdr.detectChanges();
          console.log(resp);
        }
      });
  }

  //tslint:disable-next-line:no-any
  checkFormValue(data: any): boolean {
    for (let key in data) {
      if (data[key] === true) {
        return true;
      }
    }
    return false;
  }

  sendInvite() {
    /**
     * Set Loading enabled
     */
    this.inviteProcessingErrors = [];
    if (this.selectedFName === '') {
      this.inviteProcessingErrors.push('First Name is Empty');
      this.cdr.detectChanges();
      return;
    }
    // console.log('Acaacs' + typeof(this.selectedFName));

    // if(typeof(this.selectedFName) === 'number'){

    //   this.inviteProcessingErrors = ['First Name Should be Text'];
    //   this.cdr.detectChanges();
    //   return;
    // }
    if (!RegExp('^[a-zA-Z\\s]*$').test(this.selectedFName)) {
      this.inviteProcessingErrors.push('First Name Should be string only');
      this.cdr.detectChanges();
      return;
    }

    if (this.selectedLName === '') {
      this.inviteProcessingErrors.push('Last Name is Empty');
      this.cdr.detectChanges();
      return;
    }

    if (!RegExp('^[a-zA-Z\\s]*$').test(this.selectedLName)) {
      this.inviteProcessingErrors.push('Last Name Should be string only');
      this.cdr.detectChanges();
      return;
    }

    if (this.selectedPhone === '') {
      this.inviteProcessingErrors.push('Phone Number is Empty');
      this.cdr.detectChanges();
      return;
    }

    if (!RegExp('^[0-9]*$').test(this.selectedPhone)) {
      this.inviteProcessingErrors.push('Phone Number should be Number');
      this.cdr.detectChanges();
      return;
    }

    if (!RegExp('^[0-9]{10}$').test(this.selectedPhone)) {
      console.log(this.selectedPhone);
      this.inviteProcessingErrors.push('Mobile number should be 10 digits');
      this.cdr.detectChanges();
      return;
    }

    if (this.selectedEmail === '') {
      this.inviteProcessingErrors.push('Email is Empty');
      this.cdr.detectChanges();
      return;
    }

    if (
      !RegExp('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]+').test(
        this.selectedEmail
      )
    ) {
      this.inviteProcessingErrors.push('Enter a valid email ID');
      this.cdr.detectChanges();
      return;
    }

    if (this.selectedRole === '') {
      this.inviteProcessingErrors.push('Please select a role');
      this.cdr.detectChanges();
      return;
    }

    // if (this.selectedRole === 'Payee') {
    //   if (this.payeeService.findByEmail(this.selectedEmail)) {
    //     this.inviteProcessingErrors.push('Cannot send the invite. The payee should be linked to at least 1 Account');
    //     this.cdr.detectChanges();
    //     return;
    //   }
    //   return;
    // }

    // if (this.selectedRole === 'Custom') {
    //   if (this.roleName === '') {
    //     this.inviteProcessingErrors.push('Please Enter a Custom Role');
    //     this.cdr.detectChanges();
    //     return;
    //   }
    // }

    if (this.roleName === '' && this.selectedRole === 'Custom') {
      this.inviteProcessingErrors.push('Please enter Role Name');
      this.cdr.detectChanges();
      return;
    }

    if (
      !RegExp('^[A-Za-z0-9- ]*$').test(this.roleName) &&
      this.selectedRole === 'Custom'
    ) {
      this.inviteProcessingErrors.push(
        'Role Name Should not contain special character'
      );
      this.cdr.detectChanges();
      return;
    }

    if (
      this.selectedRole === 'Custom' &&
      !this.merchantProfile.connectedBanking
    ) {
      if (this.checkFormValue(this.features)) {
      } else {
        this.inviteProcessingErrors.push('Please select at least 1 feature');
        this.cdr.detectChanges();
        return;
      }
      // if(this.features.accountList === false && this.features.addPayee === false && this.features.challans===false
      //   && this.features.createAccount === false && this.features.createTransfer === false && this.features.escrowPages === false
      //   && this.features.myPassbook === false && this.features.payeeList === false){
      //     this.inviteProcessingErrors = ['Please Select atleast one feature'];
      //     this.cdr.detectChanges();
      //     return;

      //}
      if (
        this.selectedRole === 'Custom' &&
        this.selectedItems.length === 0 &&
        !this.merchantProfile.connectedBanking
      ) {
        this.inviteProcessingErrors.push('Please select an Escrow.');
        this.cdr.detectChanges();
        return;
      }
    }

    if (
      this.selectedRole === 'Custom' &&
      !this.merchantProfile.isAccountAddAllowed
    ) {
      if (this.checkFormValue(this.featuresConnectedBanking)) {
      } else {
        this.inviteProcessingErrors.push('Please select at least 1 feature');
        this.cdr.detectChanges();
        return;
      }
      if (
        this.selectedRole === 'Custom' &&
        this.selectedBankAccounts.length === 0 &&
        !this.merchantProfile.isAccountAddAllowed
      ) {
        this.inviteProcessingErrors.push('Please select an Bank Account.');
        this.cdr.detectChanges();
        return;
      }
    }

    if (
      this.selectedRole === 'Custom' &&
      this.merchantProfile.isAccountAddAllowed &&
      this.merchantProfile.connectedBanking
    ) {
      if (
        !this.checkFormValue(this.features) &&
        !this.checkFormValue(this.featuresConnectedBanking) &&
        !this.checkFormValue(this.otherFeatures)
      ) {
        this.errors.push('Please select at least 1 feature');
        this.cdr.detectChanges();
        return;
      }

      if (
        this.selectedRole === 'Custom' &&
        this.selectedBankAccounts.length === 0 &&
        this.selectedItems.length === 0
      ) {
        this.errors.push('Please select a Bank Account or Escrow');
        this.cdr.detectChanges();
        return;
      }
    }

    if (
      this.selectedRole === 'Custom' &&
      this.merchantProfile.isAccountAddAllowed &&
      this.merchantProfile.connectedBanking &&
      this.escrowMandatory
    ) {
      if (this.selectedItems.length === 0) {
        this.inviteProcessingErrors.push('Please select an Escrow.');
        this.cdr.detectChanges();
        return;
      }
      // if (!this.checkFormValue(this.features)) {
      //   this.inviteProcessingErrors.push(
      //     'Please select at least 1 Digital Escrow feature.'
      //   );
      //   this.cdr.detectChanges();
      //   return;
      // }
    }

    this.inviteProcessing = true;
    if (this.selectedEmail === this.authService.getEmail()) {
      this.inviteProcessingErrors = ['You can’t invite yourself'];
      this.cdr.detectChanges();
      return;
    }

    const existingInvite = this.invites.filter(
      invite => invite.email === this.selectedEmail
    );
    console.log(existingInvite);
    if (existingInvite.length > 0) {
      this.inviteProcessingErrors = [
        'Invitation link already sent on this email.'
      ];
      this.cdr.detectChanges();
      return;
    }

    const existingMember = this.members.filter(
      member => member.email === this.selectedEmail
    );
    console.log(existingMember);
    if (existingMember.length > 0) {
      this.inviteProcessingErrors = [
        'User with the given email is already a member of the team.'
      ];
      this.cdr.detectChanges();
      return;
    }

    this.resendInvite();
  }

  fetchAccounts() {
    let selectedAccounts: any = [];
    for (let accounts of this.selectedItems) {
      selectedAccounts.push(accounts['id']);
    }

    if (
      this.selectedRole === 'Custom' &&
      this.selectedItems.length === 0 &&
      !this.merchantProfile.connectedBanking
    ) {
      this.errors.push('Please select an Escrow.');
      this.cdr.detectChanges();
      return;
    }

    if (this.accounts.length === selectedAccounts.length) {
      this.allAccountsSelected = true;
      return [];
    }

    return selectedAccounts;
  }

  fetchBankAccounts() {
    let selectedAccounts: any = [];
    for (let accounts of this.selectedBankAccounts) {
      selectedAccounts.push(accounts['id']);
    }

    if (
      this.selectedRole === 'Custom' &&
      this.selectedBankAccounts.length === 0 &&
      !this.merchantProfile.isAccountAddAllowed
    ) {
      this.errors.push('Please select an Bank Account');
      this.cdr.detectChanges();
      return;
    }

    if (this.bankAccounts.length === selectedAccounts.length) {
      this.allBankAccountSelected = true;
      return [];
    }

    return selectedAccounts;
  }

  resendInvite() {
    this.inviteProcessingErrors = [];
    let obj: MerchantUserTeamMember = {
      role: this.selectedRole.toLowerCase(),
      mobile: +this.selectedPhone,
      lastName: this.selectedLName,
      firstName: this.selectedFName,
      email: this.selectedEmail,
      accounts: this.fetchAccounts(),
      bankAccounts: this.fetchBankAccounts(),
      access: this.accessRoleObjectCreation(),
      roleName: this.roleName
    };
    if (this.inviteProcessingErrors.length > 0) {
      this.cdr.detectChanges();
      return;
    }
    this.profileService.sendInvite(obj).subscribe(resp => {
      this.inviteProcessing = false;
      this.access = {};
      /**
       * If Response success
       * is returned
       * Close the modal
       */
      if (resp.success) {
        this.closeModal();
        return;
      }

      this.inviteProcessingErrors = resp.errors;
      this.cdr.detectChanges();
    });
  }

  deleteInvitee() {
    this.profileService.deleteInvite(this.selectedEmail).subscribe(resp => {
      this.closeModal();
    });
  }

  // member functions

  loadMembers() {
    if (!this.merchantId) {
      this.profileService
        .getMembers(null)
        .subscribe((resp: TeamResponseModel) => {
          console.log(resp);
          if (resp.success) {
            this.members = resp.result;
            this.roleGeneration(resp);
            console.log(resp.result);
            this.cdr.detectChanges();
          }
        });
      return;
    }
    this.profileService
      .getMembers(this.merchantId)
      .subscribe((resp: TeamResponseModel) => {
        console.log(resp);
        if (resp.success) {
          this.members = resp.result;
          this.roleGeneration(resp);
          this.cdr.detectChanges();
        }
      });
  }

  updateMember() {
    this.inviteProcessingErrors = [];
    if (this.roleName === '' && this.selectedRole === 'Custom') {
      this.errors.push('Role Name is Empty');
      this.cdr.detectChanges();
      return;
    }
    if (
      this.selectedRole === 'Custom' &&
      !this.merchantProfile.connectedBanking
    ) {
      if (this.checkFormValue(this.features)) {
      } else {
        this.errors.push('Please select at least 1 feature');
        this.cdr.detectChanges();
        return;
      }

      if (this.selectedItems.length === 0) {
        this.errors.push('Please select an Escrow.');
        this.cdr.detectChanges();
        return;
      }
    }

    if (
      this.selectedRole === 'Custom' &&
      !this.merchantProfile.isAccountAddAllowed
    ) {
      if (this.checkFormValue(this.featuresConnectedBanking)) {
      } else {
        this.errors.push('Please select at least 1 feature');
        this.cdr.detectChanges();
        return;
      }

      if (this.selectedBankAccounts.length === 0) {
        this.errors.push('Please select a Bank Account.');
        this.cdr.detectChanges();
        return;
      }
    }

    if (
      this.selectedRole === 'Custom' &&
      this.merchantProfile.isAccountAddAllowed &&
      this.merchantProfile.connectedBanking
    ) {
      if (
        !this.checkFormValue(this.features) &&
        !this.checkFormValue(this.featuresConnectedBanking) &&
        !this.checkFormValue(this.otherFeatures)
      ) {
        this.errors.push('Please select at least 1 feature');
        this.cdr.detectChanges();
        return;
      }

      if (
        this.selectedRole === 'Custom' &&
        this.selectedBankAccounts.length === 0 &&
        this.selectedItems.length === 0
      ) {
        this.errors.push('Please select a Bank Account or Escrow');
        this.cdr.detectChanges();
        return;
      }

      if (
        this.selectedRole === 'Custom' &&
        this.merchantProfile.isAccountAddAllowed &&
        this.merchantProfile.connectedBanking &&
        this.escrowMandatory
      ) {
        if (this.selectedItems.length === 0) {
          this.errors.push('Please select an Escrow.');
          this.cdr.detectChanges();
          return;
        }
      }
    }
    let accounts = this.fetchAccounts();
    let roles = this.accessRoleObjectCreation();
    let bankAccounts = this.fetchBankAccounts();

    if (this.inviteProcessingErrors.length > 0) {
      this.cdr.detectChanges();
      return;
    }

    let body = {
      roleName: this.roleName,
      access: roles,
      accounts,
      bankAccounts
    };
    console.log('ROLES ', body);
    this.updateModal = false;
    if (!this.merchantId) {
      this.profileService
        .updateMember(null, this.selectedEmail, this.selectedRole, body)
        .subscribe(
          resp => {
            this.closeModal();
          },
          err => {
            console.log(err.error);
          }
        );
      return;
    }
    this.profileService
      .updateMember(
        this.merchantId,
        this.selectedEmail,
        this.selectedRole,
        body
      )
      .subscribe(
        resp => {
          this.closeModal();
        },
        err => {
          console.log(err.error);
        }
      );
  }

  deleteMember() {
    if (!this.merchantId) {
      this.profileService
        .deleteMember(null, this.selectedEmail)
        .subscribe(resp => {
          this.closeModal();
        });
    }
    this.profileService
      .deleteMember(this.merchantId, this.selectedEmail)
      .subscribe(resp => {
        this.closeModal();
      });
  }

  // modal functions
  //tslint:disable-next-line:no-any
  openModal(modal: any) {
    this.inviteProcessingErrors = [];
    this.selectedEmail = '';
    this.selectedRole = '';
    this.roleName = '';
    this.modalRef = this.modalService.open(modal);
  }

  openUpdateModal(modal: HTMLElement, email: string, role: string) {
    this.inviteProcessingErrors = [];
    this.selectedEmail = email;
    this.selectedRole = '';
    this.roleName = '';
    this.filteredRoles = this.roles.filter(r => r !== role);
    this.modalRef = this.modalService.open(modal);
    this.cdr.detectChanges();
  }

  openUpdateModalOnRoleClick(
    modal: HTMLElement,
    email: string,
    role: string,
    mobile: string,
    fName: string,
    lName: string
  ) {
    this.inviteProcessingErrors = [];
    this.errors = [];
    this.selectedEmail = email;
    this.selectedPhone = mobile;
    this.selectedFName = fName;
    this.selectedLName = lName;
    this.selectedRole = '';
    this.roleName = '';
    this.filteredRoles = this.roles.filter(r => {
      if (r.toLowerCase() === merchantUserRoles.CUSTOM.toLowerCase()) {
        return r;
      } else if (r.toLowerCase() !== role[0].toLowerCase()) {
        return r;
      }
    });
    this.modalRef = this.modalService.open(modal);
    this.cdr.detectChanges();
  }

  openResendModal(modal: HTMLElement, email: string, role: string) {
    this.inviteProcessingErrors = [];
    this.selectedEmail = email;
    this.selectedRole = role;
    this.roleName = '';
    this.modalRef = this.modalService.open(modal);
    this.cdr.detectChanges();
  }

  openMemberAlertModal(modal: HTMLElement, email: string) {
    this.selectedEmail = email;
    this.modalRef = this.modalService.open(modal);
  }

  openInviteAlertModal(modal: HTMLElement, invite: string) {
    this.selectedEmail = invite;
    this.modalRef = this.modalService.open(modal);
  }

  closeModal() {
    this.inviteProcessingErrors = [];
    if (this.updateModal) {
      this.updateModal = false;
    }
    this.selectedLName = '';
    this.selectedFName = '';
    this.selectedPhone = '';
    this.loadInvites();
    this.loadMembers();
    this.modalRef.close();
  }

  goBack() {
    this._location.back();
  }

  //tslint:disable-next-line:no-any
  selectAllItems(e: any) {
    if (e.target.checked === true) {
      this.features = _.mapValues(this.features, () => true);
      this.cdr.detectChanges();
    } else {
      this.features = _.mapValues(this.features, () => false);
      this.cdr.detectChanges();
    }

    if (this.disableAddEscrow) {
      this.features.createAccount = false;
      this.cdr.detectChanges();
    } else {
      if (
        this.merchantProfile.connectedBanking &&
        this.merchantProfile.isAccountAddAllowed &&
        this.features.createAccount
      ) {
        this.otherFeatures.addPayee = true;
        this.otherFeatures.payeeList = true;
      } else {
        this.otherFeatures.addPayee = false;
        this.otherFeatures.payeeList = false;
      }
      this.cdr.detectChanges();
    }
  }

  //tslint:disable-next-line:no-any
  selectAllItemsConnectedBanking(e: any) {
    if (e.target.checked === true) {
      this.featuresConnectedBanking = _.mapValues(
        this.featuresConnectedBanking,
        () => true
      );
      this.cdr.detectChanges();
    } else {
      this.featuresConnectedBanking = _.mapValues(
        this.featuresConnectedBanking,
        () => false
      );
      this.cdr.detectChanges();
    }
  }

  //tslint:disable-next-line:no-any
  onChange(e: any) {
    console.log('onChange.....');
  }

  accessRoleObjectCreation(): object {
    let obj: any = {};

    if (this.selectedRole.toLowerCase() === merchantUserRoles.CUSTOM) {
      if (
        this.merchantProfile.isAccountAddAllowed &&
        this.merchantProfile.connectedBanking
      ) {
        this.features.addPayee = false;
        this.features.payeeList = false;
        this.featuresConnectedBanking.addPayee = false;
        this.featuresConnectedBanking.payeeList = false;
      }
      if (this.merchantProfile.isAccountAddAllowed) {
        if (
          this.merchantProfile.connectedBanking &&
          Object.values(this.features).some(value => value === true) &&
          Object.values(this.featuresConnectedBanking).some(
            value => value === true
          )
        ) {
          Object.assign(obj, { digitalEscrow: ['Digital Escrow'] });
        }
        if (this.features.accountList) {
          Object.assign(obj, { accounts: ['List'] });
        }
        if (this.features.createAccount) {
          if (!('accounts' in obj)) {
            Object.assign(obj, { accounts: ['List', 'Add Account'] });
          } else {
            obj.accounts.push('Add Account');
          }
        }
        if (this.features.payeeList) {
          Object.assign(obj, { payee: ['List'] });
        }
        if (this.features.addPayee) {
          if ('payee' in obj) {
            obj.payee.push('Add Payee');
          } else {
            obj['payee'] = ['Add Payee'];
          }
        }

        if (this.features.singleTransfer) {
          Object.assign(obj, {
            transfer: ['Single Transfer']
          });
        }
        if (this.features.bulkTransfer) {
          if ('transfer' in obj) {
            obj.transfer.push('Bulk Transfer');
          } else {
            Object.assign(obj, {
              transfer: ['Bulk Transfer']
            });
          }
        }
        if (this.features.myPassbook) {
          Object.assign(obj, {
            passbook: ['Inward Funds Deposit', 'Outward Fund Transfer']
          });
        }
        // if (this.features.escrowQr) {
        //   if (
        //     !Object.keys(obj).includes('accounts') ||
        //     !obj['accounts'].includes('List')
        //   ) {
        //     this.inviteProcessingErrors.push('Please select an Escrow.');
        //     this.cdr.detectChanges();
        //   }
        //   Object.assign(obj, {
        //     escrowQR: ['List', 'Create Escrow QR']
        //   });
        // }
        // if (this.features.escrowPages) {
        //   Object.assign(obj, {
        //     escrowPage: ['List', 'Create Escrow Page']
        //   });
        // }
        // if (this.features.challans) {
        //   Object.assign(obj, {
        //     challan: ['List', 'Create Challan']
        //   });
        // }
      }

      if (this.merchantProfile.connectedBanking) {
        if (
          this.merchantProfile.isAccountAddAllowed &&
          Object.values(this.featuresConnectedBanking).some(
            value => value === true
          ) &&
          Object.values(this.features).some(value => value === true)
        ) {
          Object.assign(obj, { connectedBanking: ['Connected Banking'] });
        }
        if (this.featuresConnectedBanking.bankAccounts) {
          Object.assign(obj, { bankAccounts: ['Bank Account'] });
        }

        if (this.featuresConnectedBanking.payeeList) {
          Object.assign(obj, { payee: ['List'] });
        }

        if (this.featuresConnectedBanking.addPayee) {
          if ('payee' in obj) {
            obj.payee.push('Add Payee');
          } else {
            obj['payee'] = ['Add Payee'];
          }
        }

        if (this.featuresConnectedBanking.singleTransfer) {
          Object.assign(obj, {
            connectedBankingTransfer: ['Single Transfer']
          });
        }

        if (this.featuresConnectedBanking.bulkTransfer) {
          if ('connectedBankingTransfer' in obj) {
            obj.connectedBankingTransfer.push('Bulk Transfer');
          } else {
            Object.assign(obj, {
              connectedBankingTransfer: ['Bulk Transfer']
            });
          }
        }

        if (this.featuresConnectedBanking.bankAccountTransfer) {
          Object.assign(obj, {
            bankAccountTransfer: ['Bank Account Transfer']
          });
        }

        if (this.featuresConnectedBanking.depositList) {
          Object.assign(obj, {
            depositList: ['Deposit List']
          });
        }
      }

      if (this.otherFeatures.payeeList) {
        Object.assign(obj, { payee: ['List'] });
      }

      if (this.otherFeatures.addPayee) {
        if ('payee' in obj) {
          obj.payee.push('Add Payee');
        } else {
          obj['payee'] = ['Add Payee'];
        }
      }

      return obj;
    }
    return obj;
  }

  roleGeneration(resp: any) {
    resp.result.forEach((merchantUser: MerchantUser) => {
      if (merchantUser.role && merchantUser.role.includes('custom')) {
        let ragnarok: string[] = [];
        if (merchantUser.access.accounts) {
          let concatString = this.concatStringHelper(
            'Escrows',
            merchantUser.access.accounts.includes('Add Account')
              ? ['List', 'Add Escrow']
              : merchantUser.access.accounts
          );
          ragnarok.push(concatString);
        }
        if (merchantUser.access.challan) {
          let concatString = this.concatStringHelper(
            'Challan',
            merchantUser.access.challan
          );
          ragnarok.push(concatString);
        }
        if (merchantUser.access.escrowPage) {
          let concatString = this.concatStringHelper(
            'Escrow Pages',
            merchantUser.access.escrowPage
          );
          ragnarok.push(concatString);
        }
        if (merchantUser.access.passbook) {
          let concatString = this.concatStringHelper(
            'PassBook',
            merchantUser.access.passbook
          );
          ragnarok.push(concatString);
        }
        if (merchantUser.access.payee) {
          let concatString = this.concatStringHelper(
            'Payee',
            merchantUser.access.payee
          );
          ragnarok.push(concatString);
        }
        if (merchantUser.access.transfer) {
          let concatString = this.concatStringHelper(
            'Transfers',
            merchantUser.access.transfer
          );
          ragnarok.push(concatString);
        }
        if (merchantUser.access.escrowQR) {
          let concatString = this.concatStringHelper(
            'EscrowQR',
            merchantUser.access.escrowQR
          );
          ragnarok.push(concatString);
        }

        if (merchantUser.access.bankAccounts) {
          ragnarok.push('Bank Account');
        }

        if (merchantUser.access.connectedBankingTransfer) {
          let concatString = this.concatStringHelper(
            'Connected Banking Transfer',
            merchantUser.access.connectedBankingTransfer
          );
          ragnarok.push(concatString);
        }

        if (merchantUser.access.bankAccountTransfer) {
          ragnarok.push('Bank Account Transfer');
        }

        if (merchantUser.access.depositList) {
          ragnarok.push('Deposit List');
        }
        merchantUser.roleStringStruct = ragnarok;
      } else {
      }
    });
  }

  checkBoxVal(event: Event, feature: string) {
    if (!(event.target as HTMLInputElement).checked) {
      if (feature === 'bankAccountTransfer') {
        this.featuresConnectedBanking.singleTransfer = false;
        this.featuresConnectedBanking.bulkTransfer = false;
      }

      if (feature === 'myPassbook') {
        this.features.singleTransfer = false;
        this.features.bulkTransfer = false;
      }

      if (feature === 'accountList') {
        this.features.createAccount = false;
      }

      if (feature === 'payeeList') {
        this.features.addPayee = false;
        this.features.createAccount = false;
      }

      if (feature === 'cbPayeeList') {
        this.featuresConnectedBanking.addPayee = false;
      }

      if (feature === 'addPayee') {
        this.features.createAccount = false;
      }

      if (feature === 'othersAddPayee') {
        this.features.createAccount = false;
      }

      if (feature === 'othersPayeeList') {
        this.features.createAccount = false;
        this.otherFeatures.addPayee = false;
      }
    } else {
      if (feature === 'createAccount') {
        this.features.accountList = true;
        this.features.addPayee = true;
        this.features.payeeList = true;
        if (
          this.merchantProfile.connectedBanking &&
          this.merchantProfile.isAccountAddAllowed
        ) {
          this.otherFeatures.addPayee = true;
          this.otherFeatures.payeeList = true;
        }
      }

      if (feature === 'addPayee') {
        this.features.payeeList = true;
      }

      if (feature === 'cbAddPayee') {
        this.featuresConnectedBanking.payeeList = true;
      }

      if (feature === 'othersAddPayee') {
        this.otherFeatures.payeeList = true;
      }

      if (feature === 'singleTransfer' || feature === 'bulkTransfer') {
        this.features.myPassbook = true;
      }

      if (feature === 'cbSingleTransfer' || feature === 'cbBulkTransfer') {
        this.featuresConnectedBanking.bankAccountTransfer = true;
      }
    }
    this.cdr.detectChanges();
  }

  checkValues() {
    let excludeFeature2: string[] = ['createAccount'];
    if (
      this.merchantProfile.connectedBanking &&
      this.merchantProfile.isAccountAddAllowed
    ) {
      excludeFeature2 = ['createAccount', 'addPayee', 'payeeList'];
    }
    if (!this.disableAddEscrow) {
      excludeFeature2.splice(0, 1);
    }

    if (
      Object.keys(this.features)
        .filter(key => !excludeFeature2.includes(key))
        .some(
          key => (this.features as { [key: string]: boolean })[key] === false
        )
    ) {
      if (this.selectAllItemsCheckBox) {
        this.selectAllItemsCheckBox = false;
      }
    } else if (
      Object.keys(this.features)
        .filter(key => !excludeFeature2.includes(key))
        .some(
          key => (this.features as { [key: string]: boolean })[key] !== false
        )
    ) {
      if (!this.selectAllItemsCheckBox) {
        this.selectAllItemsCheckBox = true;
      }
    }

    let excludedFeature: string[] = [];
    if (
      this.merchantProfile.connectedBanking &&
      this.merchantProfile.isAccountAddAllowed
    ) {
      excludedFeature = ['addPayee', 'payeeList'];
    }
    if (
      Object.keys(this.featuresConnectedBanking)
        .filter(key => !excludedFeature.includes(key))
        .some(
          key =>
            (this.featuresConnectedBanking as { [key: string]: boolean })[
              key
            ] === false
        )
    ) {
      if (this.selectAllConnectedBanking) {
        this.selectAllConnectedBanking = false;
      }
    } else if (
      Object.keys(this.featuresConnectedBanking)
        .filter(key => !excludedFeature.includes(key))
        .some(
          key =>
            (this.featuresConnectedBanking as { [key: string]: boolean })[
              key
            ] !== false
        )
    ) {
      if (!this.selectAllConnectedBanking) {
        this.selectAllConnectedBanking = true;
      }
    }

    this.cdr.detectChanges();
  }

  concatStringHelper(val: string, arr: string[]): string {
    let concatString = `${val}- `;
    arr.forEach((it, index) => {
      concatString += it.concat(arr.length === index + 1 ? '.' : ', ');
    });
    return concatString;
  }
}

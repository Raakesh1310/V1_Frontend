import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountsAdminService } from '@modules/accounts/services';
import { MerchantService } from '@modules/merchant/services';
import { ProfileService } from '@modules/profile/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { AuthorizerModel } from '@common/models/authorizer.model';
import authorizerActionConstant from '@common/constants/authorizer-action.constant';
import authorizerStatusConstant from '@common/constants/authorizer-status.constant';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import accountsStatus from '@modules/accounts/constants/accountsStatus';
import { AuthService } from '@modules/auth/services';
import merchantUserRoles from 'config/merchantUserRoles';

@Component({
  selector: 'sbpro-bank-authorizers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bank-authorizers.component.pug',
  styleUrls: ['bank-authorizers.component.scss']
})
export class BankAuthorizersComponent implements OnInit {
  @Input() merchantId = '';
  @Input() accountId = '';
  detailsModal?: NgbModalRef;
  modalRef: NgbModalRef | null = null;
  @ViewChild('detailsTemplate')
  private detailsTemplate!: TemplateRef<any>;
  authorizerForm!: FormGroup;
  authorizerUpdateForm!: FormGroup;
  levels: number[] = [1];
  lastLevel = 1;
  bankAuthorizers: any = [];
  authHistory: any = [];
  accountAuthorizers: AuthorizerModel[] = [];
  merchantAuthorizers: AuthorizerModel[] = [];
  approvalsRequired = 0;
  selectedName = '';
  selectedBank = '';
  selectedAccess = '';
  selectedEmail = '';
  selectedMobile = '';
  selectedLevel = 1;
  selectedAuthorizerId = '';
  levelMembers = 0;
  allApprovalsRequired = false;
  approvalsRequiredError = false;
  duplicateEmailError = false;
  newLevelError: boolean = false;
  validLevelError: boolean = false;
  validNameError: boolean = false;
  validMobileError: boolean = false;
  validApprovalsRequiredError: boolean = false;
  validEmailError: boolean = false;
  errors: string[] = [];
  accountAuthError: boolean = false;
  merchantAuthError: boolean = false;
  incompleteFormError: boolean = false;
  deletingAuthorizerEmail: string = '';
  selectedApprovalRequired: number = 0;
  updatingEmail: string = '';
  updatingAuthorizer: AuthorizerModel | undefined = undefined;
  accountStatus = '';
  accountStatusError = false;
  modalOpened = false;
  zeroMemberError: boolean = false;
  newAuthorizer: boolean = false;
  deletingAuthorizers = 0;
  wholeNumberError = false;
  disableAddButton = false;
  lessMemberError: boolean = false;
  access: string = '';
  @Input() readOnly = false;
  roles: string[] = [];
  isTrustee = false;
  isSuperAdminViewer = false;

  // bank: string = '';
  selectBankError: boolean = false;
  selectAccessError = false;

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private merchantService: MerchantService,
    private profileService: ProfileService,
    private spinner: NgxSpinnerService,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    this.authorizerForm = this.formBuilder.group({
      name: [null, Validators.required],
      email: [null, Validators.required],
      mobile: [null, Validators.required],
      level: [null, Validators.required]
    });

    this.authorizerUpdateForm = this.formBuilder.group({
      name: [null, Validators.required],
      email: [null, Validators.required],
      mobile: [null, Validators.required],
      level: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.removeOldErrors();

    this.spinner.show();

    this.checkForReadOnly();

    this.profileService
      .getAuthorizers(this.merchantId, 'merchant-authorizers')
      .subscribe(
        (resp: any) => {
          console.log(resp);

          if (resp.success) {
            if (
              !resp.result.merchantAuthorizers ||
              resp.result.merchantAuthorizers.length === 0
            ) {
              this.spinner.hide();
              this.cdr.detectChanges();
              return;
            }
            this.bankAuthorizers = resp.result.merchantAuthorizers;
            this.authHistory = JSON.parse(
              JSON.stringify(resp.result.merchantAuthorizers)
            );
            this.lastLevel = Math.max(
              ...this.bankAuthorizers.map((o: AuthorizerModel) => {
                if (o.status !== authorizerStatusConstant.inactive) {
                  return o.level;
                } else {
                  return 1;
                }
              })
            );
            this.selectedLevel = this.lastLevel;
            this.levels =
              this.lastLevel === 1 ? [1] : _.range(1, this.lastLevel + 1);
            this.arrangeAuthorizers();
            this.spinner.hide();
            this.cdr.detectChanges();
          }
        },
        error => {
          this.errors = error.error.errors;
          this.showToast('Error', `${error.error.errors}`, {
            headerClasses: 'bg-danger text-white'
          });
          this.spinner.hide();
          this.cdr.detectChanges();
        },
        () => {
          // 'onCompleted' callback.
          // No errors, route to new page here
          this.spinner.hide();
          this.cdr.detectChanges();
        }
      );
  }

  checkForReadOnly() {
    this.roles = this.authService.getRole();

    this.isTrustee =
      this.roles?.indexOf(merchantUserRoles.TRUSTEE) > -1 ? true : false;

    this.isSuperAdminViewer =
      this.roles?.indexOf(merchantUserRoles.SUPER_ADMIN_VIEWER) > -1
        ? true
        : false;
    if (this.roles && (this.isTrustee || this.isSuperAdminViewer)) {
      this.readOnly = true;
    }
  }

  onFocus() {
    this.allApprovalsRequired = false;
    this.approvalsRequired = this.selectedApprovalRequired;
    this.cdr.detectChanges();
  }

  //Add authorizer to list of authorizers
  onAdd() {
    if (this.accountId && this.accountStatus !== accountsStatus.ACTIVE) {
      this.accountStatusError = true;
      this.cdr.detectChanges();
      return;
    }

    this.incompleteFormError = false;
    if (
      this.validEmailError ||
      this.validLevelError ||
      this.validNameError ||
      this.validMobileError ||
      this.validLevelError ||
      this.newLevelError
    ) {
      this.spinner.hide();
      return;
    }

    this.removeOldErrors();
    this.spinner.show();
    this.duplicateEmailError = false;
    let email = this.authorizerForm.value['email'];
    let name = this.authorizerForm.value['name'];
    let mobile = this.authorizerForm.value['mobile'];
    let level = this.authorizerForm.value['level'];

    if (!email || !name || !mobile) {
      this.incompleteFormError = true;
      this.spinner.hide();
      this.cdr.detectChanges();
      return;
    }

    this.validateEmail(email);
    if (this.validEmailError) {
      this.spinner.hide();
      return;
    }
    this.validateName(name);
    if (this.validNameError) {
      this.spinner.hide();
      return;
    }
    this.validateMobile(mobile);
    if (this.validMobileError) {
      this.spinner.hide();
      return;
    }
    this.onLevelChange(level);
    if (this.validLevelError || this.newLevelError) {
      this.spinner.hide();
      return;
    }

    if (
      this.bankAuthorizers.length > 0 &&
      this.bankAuthorizers.find(
        (authorizer: AuthorizerModel) =>
          (authorizer.email === email &&
            authorizer.level === level &&
            authorizer.status === authorizerStatusConstant.active) ||
          (authorizer.email === email &&
            authorizer.level === level &&
            authorizer.action === authorizerActionConstant.created)
      )
    ) {
      this.duplicateEmailError = true;
      this.spinner.hide();
      this.cdr.detectChanges();
      return;
    }

    if (
      this.accountId === '' &&
      this.accountAuthorizers !== null &&
      this.accountAuthorizers.find(
        (authorizer: AuthorizerModel) =>
          (authorizer.email === email &&
            authorizer.status === authorizerStatusConstant.active) ||
          (authorizer.email === email &&
            authorizer.action === authorizerActionConstant.created)
      )
    ) {
      this.accountAuthError = true;
      this.spinner.hide();
      this.cdr.detectChanges();
      return;
    } else if (
      this.accountId !== '' &&
      this.merchantAuthorizers !== null &&
      this.merchantAuthorizers.find(
        (authorizer: AuthorizerModel) =>
          (authorizer.email === email &&
            authorizer.status === authorizerStatusConstant.active) ||
          (authorizer.email === email &&
            authorizer.action === authorizerActionConstant.created)
      )
    ) {
      this.merchantAuthError = true;
      this.spinner.hide();
      this.cdr.detectChanges();
      return;
    }

    if (this.bankAuthorizers && this.bankAuthorizers.length > 0) {
      let level = this.authorizerForm.value['level'];
      if (typeof level !== 'number') {
        this.validLevelError = true;
        this.spinner.hide();
        this.cdr.detectChanges();
        return;
      }
      let approvalsRequired = null;
      for (let authorizer of this.bankAuthorizers) {
        if (
          authorizer.level === level &&
          authorizer.status !== authorizerStatusConstant.inactive
        ) {
          if (
            authorizer.action !== authorizerActionConstant.deleted &&
            authorizer.approvalsRequired
          ) {
            approvalsRequired = authorizer.approvalsRequired;
          } else {
            approvalsRequired = null;
          }
        }
        
      }

      for (let authorizer of this.bankAuthorizers) {
        if (authorizer.level === level) {
          authorizer.approvalsRequired = approvalsRequired;
        }
      }

      Object.assign(this.authorizerForm.value, { approvalsRequired });
    } else {
      Object.assign(this.authorizerForm.value, { approvalsRequired: null });
    }

    Object.assign(this.authorizerForm.value, { createdAt: new Date() });
    Object.assign(this.authorizerForm.value, { updatedAt: new Date() });
    Object.assign(this.authorizerForm.value, {
      action: authorizerActionConstant.created
    });
    if (this.bankAuthorizers.length === 0) {
      this.bankAuthorizers = [this.authorizerForm.value];
    } else {
      this.bankAuthorizers.unshift(this.authorizerForm.value);
    }
    this.newAuthorizer = true;
    this.authorizerForm.reset();
    console.log(this.bankAuthorizers);
    this.spinner.hide();
    this.authorizerForm.controls.level.setValue(level);
    this.cdr.detectChanges();
  }

  //Get no of members of a level
  getLevelMemberCount(level: number) {
    let levelMembers = 0;
    this.bankAuthorizers.map((obj: AuthorizerModel) => {
      if (obj.status === authorizerStatusConstant.active && obj.level === level)
        levelMembers += 1;
    });
    return levelMembers;
  }

  /**
   * Show level details
   * like no of members in the
   * approvals required
   * @param modal
   * @param level
   */
  showLevelDetails(
    modal: TemplateRef<any>,
    authorizer: AuthorizerModel
    // level: number,
    // approvalsRequired: number
  ) {
    if (this.accountId && this.accountStatus !== accountsStatus.ACTIVE) {
      this.accountStatusError = true;
      this.cdr.detectChanges();
      return;
    }

    if (this.deletingAuthorizerEmail !== '') {
      return;
    }
    this.spinner.show();
    this.levelMembers = 0;
    this.bankAuthorizers.map((obj: AuthorizerModel) => {
      if (
        obj.status !== authorizerStatusConstant.inactive &&
        obj.level === authorizer.level
      )
        this.levelMembers += 1;
    });

    this.selectedLevel = authorizer.level as number;
    this.selectedApprovalRequired = authorizer.approvalsRequired;
    // this.access = authorizer.access as string;
    // this.bank = authorizer.bank as string;

    this.detailsModal = this.modalService.open(modal, {
      backdrop: 'static',
      size: 'md'
    });
    this.spinner.hide();
    this.cdr.detectChanges();
  }

  //Add level
  onLevelChange($event: Event) {
    // this.newLevelError = false;
    // this.validLevelError = false;
    this.removeOldErrors();
    let lvl = this.authorizerForm.value['level'];
    let updatedlvl = this.authorizerUpdateForm.value['level'];
    if (lvl === 'Add' || (this.modalOpened && updatedlvl === 'Add')) {
      if (this.lastLevel) {
        if (
          this.bankAuthorizers.filter(
            (obj: AuthorizerModel) =>
              obj.level === this.lastLevel &&
              obj.status !== authorizerStatusConstant.inactive
          ).length === 0
        ) {
          this.newLevelError = true;
          this.selectedLevel = this.levels[this.levels.length - 1];
          this.spinner.hide();
          this.cdr.detectChanges();
          return;
        }
      }

      this.lastLevel = this.lastLevel ? this.lastLevel + 1 : 2;
      this.levels.push(this.lastLevel);
      this.selectedLevel = this.levels[this.levels.length - 1];

      this.cdr.detectChanges();
    }

    if (lvl === '' || (this.modalOpened && updatedlvl === '')) {
      this.validLevelError = true;
      this.spinner.hide();
      this.cdr.detectChanges();
      return;
    }
  }

  onKey($event: any) {
    this.approvalsRequired = $event.target.value;
    if (this.approvalsRequired % 1 != 0) {
      this.wholeNumberError = true;
    } else {
      this.wholeNumberError = false;
    }
    if (this.approvalsRequired > this.levelMembers) {
      this.approvalsRequiredError = true;
    } else {
      this.approvalsRequiredError = false;
    }
    if (this.approvalsRequired <= 0) {
      this.validApprovalsRequiredError = true;
    } else {
      this.validApprovalsRequiredError = false;
    }
    this.cdr.detectChanges();
  }

  onEmailChange($event: any) {
    this.removeOldErrors();

    this.validMobileError = false;
    this.validNameError = false;
    let email: string = $event.target.value;
    this.validateEmail(email);
  }

  validateEmail(email: string) {
    let emailParts = email.split('@');
    if (email.length > 254 || emailParts.length !== 2) {
      this.validEmailError = true;
      this.cdr.detectChanges();
      return;
    }

    let matched = new RegExp(
      /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z\-]+\.)+[A-Za-z]{2,}))$/
    ).test(email);
    if (!matched) {
      this.validEmailError = true;
      this.spinner.hide();
    } else {
      this.validEmailError = false;
    }
    this.cdr.detectChanges();
  }

  onNameChange($event: any) {
    this.removeOldErrors();
    this.validMobileError = false;
    this.validEmailError = false;
    let name: string = $event.target.value;
    this.validateName(name);
  }

  validateName(name: string) {
    let matched = new RegExp(/^[a-zA-Z0-9 ]{3,45}$/).test(name);
    if (!matched) {
      this.validNameError = true;
      this.spinner.hide();
    } else {
      this.validNameError = false;
    }
    this.cdr.detectChanges();
  }

  onMobileChange($event: any) {
    this.removeOldErrors();
    this.validEmailError = false;
    this.validNameError = false;
    let mobile: string = $event.target.value;
    this.validateMobile(mobile);
  }

  validateMobile(mobile: string) {
    if (mobile.length !== 10) {
      this.validMobileError = true;
      this.spinner.hide();
    } else {
      this.validMobileError = false;
    }
    this.cdr.detectChanges();
  }

  //
  onApprovalRequiredChange($event: any) {
    if ($event.target.value === 'all') {
      this.approvalsRequiredError = false;
      this.validApprovalsRequiredError = false;
      this.allApprovalsRequired = true;
      this.approvalsRequired = this.levelMembers;
    } else if (this.selectedApprovalRequired === null) {
      this.approvalsRequiredError = false;
      this.approvalsRequired = this.selectedApprovalRequired;
    }
    this.cdr.detectChanges();
  }

  onPermissionsChange($event: any) {
    this.access = $event.target.value;
    this.cdr.detectChanges();
  }

  // Open authorizer details to update
  openUpdateModal(
    modal: HTMLElement,
    name: string,
    email: string,
    mobile: string,
    level: number,
    authorizer: AuthorizerModel
  ) {
    this.removeOldErrors();
    if (this.accountId && this.accountStatus !== accountsStatus.ACTIVE) {
      this.accountStatusError = true;
      this.cdr.detectChanges();
      return;
    }

    if (!this.updatingAuthorizer) {
      this.updatingAuthorizer = authorizer;
      this.updatingEmail = authorizer.email;
      this.authorizerUpdateForm.controls.email.setValue(email);
      this.authorizerUpdateForm.controls.mobile.setValue(mobile);
      this.authorizerUpdateForm.controls.name.setValue(name);
      this.authorizerUpdateForm.controls.level.setValue(level);
      this.authorizerForm.disable();
      this.disableAddButton = true;

      this.modalRef = this.modalService.open(modal);
    } else {
      this.updatingAuthorizer = undefined;
      this.updatingEmail = '';
      this.bankAuthorizers = JSON.parse(JSON.stringify(this.authHistory));
      if (this.authHistory.length > 0) {
        this.lastLevel = Math.max(
          ...this.authHistory.map((o: AuthorizerModel) => o.level)
        );
        this.selectedLevel = this.lastLevel;
        this.levels =
          this.lastLevel === 1 ? [1] : _.range(1, this.lastLevel + 1);
        this.arrangeAuthorizers();
        this.authorizerForm.enable();
        this.disableAddButton = false;
      }
    }
    this.modalOpened = true;
    this.cdr.detectChanges();
  }

  //Update authorizer details
  updateAuthorizer() {
    if (this.accountId && this.accountStatus !== accountsStatus.ACTIVE) {
      this.accountStatusError = true;
      this.cdr.detectChanges();
      return;
    }

    if (
      this.validEmailError ||
      this.validLevelError ||
      this.validNameError ||
      this.validMobileError ||
      this.validLevelError ||
      this.newLevelError
    ) {
      return;
    }
    this.removeOldErrors();
    this.spinner.show();

    this.duplicateEmailError = false;
    // let email = this.authorizerForm.value['email'];
    let name = this.authorizerUpdateForm.value['name'];
    let mobile = this.authorizerUpdateForm.value['mobile'];
    let level = this.authorizerUpdateForm.value['level'];

    if (!name || !mobile) {
      this.incompleteFormError = true;
      this.spinner.hide();
      this.cdr.detectChanges();
      return;
    }

    this.validateName(name);
    if (this.validNameError) {
      this.spinner.hide();
      return;
    }
    this.validateMobile(mobile);
    if (this.validMobileError) {
      this.spinner.hide();
      return;
    }
    this.onLevelChange(level);
    if (this.validLevelError || this.newLevelError) {
      this.spinner.hide();
      return;
    }

    if (
      this.authorizerUpdateForm.value['level'] ===
        this.updatingAuthorizer?.level &&
      this.authorizerUpdateForm.value['mobile'] ===
        this.updatingAuthorizer?.mobile &&
      this.authorizerUpdateForm.value['name'] === this.updatingAuthorizer?.name
    ) {
      this.updatingAuthorizer = undefined;
      this.updatingEmail = '';
      this.authorizerForm.enable();
      this.disableAddButton = false;
      this.spinner.hide();
      this.closeModal();
      this.cdr.detectChanges();
      return;
    }
    this.bankAuthorizers = this.bankAuthorizers.filter(
      (obj: AuthorizerModel) => obj.email !== this.updatingAuthorizer?.email
    );
    this.bankAuthorizers.unshift(
      Object.assign(this.authorizerUpdateForm.value, {
        authorizerId: this.updatingAuthorizer?.authorizerId,
        updatedAt: new Date().toISOString(),
        action:
          this.updatingAuthorizer?.action === authorizerActionConstant.created
            ? authorizerActionConstant.created
            : authorizerActionConstant.updated
      })
    );

    let updatingLevel: number = this.updatingAuthorizer?.level as number;
    let lvlMembers = 0;
    for (let authorizer of this.bankAuthorizers) {
      if (
        authorizer.level === updatingLevel &&
        authorizer.action !== authorizerActionConstant.deleted &&
        authorizer.status === authorizerStatusConstant.active
      ) {
        lvlMembers += 1;

        delete authorizer.approvalsRequired;
      }

      if (
        authorizer.level === level &&
        authorizer.action !== authorizerActionConstant.deleted &&
        authorizer.status === authorizerStatusConstant.active
      ) {
        delete authorizer.approvalsRequired;
      }
    }

    if (lvlMembers === 0 && updatingLevel < level) {
      this.authorizerForm.enable();
      this.disableAddButton = false;
      this.updatingAuthorizer = undefined;
      this.updatingEmail = '';
      this.bankAuthorizers = JSON.parse(JSON.stringify(this.authHistory));
      if (this.authHistory.length > 0) {
        this.lastLevel = Math.max(
          ...this.authHistory.map((o: AuthorizerModel) => o.level)
        );
        this.selectedLevel = this.lastLevel;
        this.levels =
          this.lastLevel === 1 ? [1] : _.range(1, this.lastLevel + 1);
        this.arrangeAuthorizers();
      }
      this.removeOldErrors();
      this.zeroMemberError = true;
      this.closeModal();
      this.spinner.hide();
      this.cdr.detectChanges();
      return;
    }

    for (let authorizer of this.bankAuthorizers) {
      if (
        lvlMembers === 0 &&
        this.updatingAuthorizer?.level &&
        this.updatingAuthorizer?.level < authorizer.level
      ) {
        authorizer.level -= 1;
      }
    }

    if (lvlMembers === 0) {
      this.lastLevel = this.lastLevel - 1;
      this.levels = this.lastLevel === 1 ? [1] : _.range(1, this.lastLevel + 1);
    }

    this.arrangeAuthorizers();
    console.log(this.bankAuthorizers);
    this.closeModal();
    this.spinner.hide();
    this.cdr.detectChanges();
  }

  /**
   * Delete Authorizer
   * Mark Deleted
   * @param authorizerId
   */
  deleteAuthorizer(email: string, level: number) {
    this.removeOldErrors();
    if (this.accountId && this.accountStatus !== accountsStatus.ACTIVE) {
      this.accountStatusError = true;
      this.cdr.detectChanges();
      return;
    }

    this.spinner.show();
    let deletedAuthorizer: AuthorizerModel | undefined = undefined;

    let i = this.bankAuthorizers.length;
    let tempAuthorizers = JSON.parse(JSON.stringify(this.bankAuthorizers));
    while (i--) {
      if (
        email === tempAuthorizers[i].email &&
        level === tempAuthorizers[i].level
      ) {
        deletedAuthorizer = tempAuthorizers[i];
        this.deletingAuthorizerEmail = tempAuthorizers[i].email;
        if (tempAuthorizers[i].action === authorizerActionConstant.created) {
          this.bankAuthorizers.splice(i, 1);
          this.deletingAuthorizerEmail = '';
          this.deletingAuthorizers += 1;
          this.cdr.detectChanges();
          continue;
        }
        if (tempAuthorizers[i].action === authorizerActionConstant.deleted) {
          this.bankAuthorizers[i].action = '';
          this.deletingAuthorizerEmail = '';
          this.deletingAuthorizers -= 1;
          this.authorizerForm.enable();
          this.disableAddButton = false;
          // this.authorizers = this.authHistory;
        } else {
          this.bankAuthorizers[i].action = authorizerActionConstant.deleted;
          this.deletingAuthorizerEmail = this.bankAuthorizers[i].email;
          this.authorizerForm.disable();
          this.disableAddButton = true;
          this.deletingAuthorizers += 1;
        }
      }
    }

    if (
      this.bankAuthorizers.filter(
        (authorizer: AuthorizerModel) =>
          authorizer.action === authorizerActionConstant.created
      ).length === 0 &&
      this.bankAuthorizers.filter(
        (authorizer: AuthorizerModel) =>
          authorizer.action === authorizerActionConstant.deleted
      ).length === 0
    ) {
      this.newAuthorizer = false;
      this.bankAuthorizers = JSON.parse(JSON.stringify(this.authHistory));
      if (this.authHistory.length > 0) {
        this.lastLevel = Math.max(
          ...this.authHistory.map((o: AuthorizerModel) => o.level)
        );
        this.selectedLevel = this.lastLevel;
        this.levels =
          this.lastLevel === 1 ? [1] : _.range(1, this.lastLevel + 1);
        this.arrangeAuthorizers();
      }
      this.spinner.hide();
      this.cdr.detectChanges();
      return;
    }

    if (this.bankAuthorizers.length > 0 && deletedAuthorizer != undefined) {
      let level = deletedAuthorizer.level;
      // let approvalsRequired = 0;
      let lvlMembers = 0;
      for (let authorizer of this.bankAuthorizers) {
        if (
          authorizer.level === level &&
          authorizer.action !== authorizerActionConstant.deleted &&
          authorizer.status === authorizerStatusConstant.active
        ) {
          // approvalsRequired += 1;
          lvlMembers += 1;
        }
      }

      if (lvlMembers > 0) {
        if (lvlMembers < deletedAuthorizer.approvalsRequired) {
          this.lessMemberError = true;
          this.deletingAuthorizers = 0;
          this.deletingAuthorizerEmail = '';
          this.bankAuthorizers = JSON.parse(JSON.stringify(this.authHistory));
          if (this.authHistory.length > 0) {
            this.lastLevel = Math.max(
              ...this.authHistory.map((o: AuthorizerModel) => o.level)
            );
            this.selectedLevel = this.lastLevel;
            this.levels =
              this.lastLevel === 1 ? [1] : _.range(1, this.lastLevel + 1);
            this.arrangeAuthorizers();
          }
          this.spinner.hide();
          this.cdr.detectChanges();

          return;
        }
      }

      for (let authorizer of this.bankAuthorizers) {
        // if (authorizer.level === level) {
        //   authorizer.approvalsRequired = approvalsRequired;
        // }
        if (
          lvlMembers === 0 &&
          deletedAuthorizer.level &&
          deletedAuthorizer.level < authorizer.level &&
          authorizer?.status !== authorizerStatusConstant.inactive
        ) {
          authorizer.level -= 1;
        }
      }

      this.lastLevel = this.lastLevel - 1;
      this.levels = this.lastLevel <= 1 ? [1] : _.range(1, this.lastLevel + 1);
    }

    if (
      this.bankAuthorizers.filter(
        (authorizer: AuthorizerModel) =>
          authorizer.action === authorizerActionConstant.created
      ).length === 0
    ) {
      this.newAuthorizer = false;
    }

    this.spinner.hide();
    this.cdr.detectChanges();
  }

  closeModal() {
    this.modalOpened = false;
    this.modalRef?.close();
  }

  onCancel() {
    this.authorizerForm.enable();
    this.disableAddButton = false;
    this.updatingAuthorizer = undefined;
    this.updatingEmail = '';
    this.bankAuthorizers = JSON.parse(JSON.stringify(this.authHistory));
    if (this.authHistory.length > 0) {
      this.lastLevel = Math.max(
        ...this.authHistory.map((o: AuthorizerModel) => o.level)
      );
      this.selectedLevel = this.lastLevel;
      this.levels = this.lastLevel === 1 ? [1] : _.range(1, this.lastLevel + 1);
      this.arrangeAuthorizers();
    }
    this.removeOldErrors();
    this.cdr.detectChanges();
    this.closeModal();
  }

  closeLevelUpdateModal() {
    this.detailsModal?.close();
  }

  onLevelDetailsUpdate() {
    if (
      this.validApprovalsRequiredError ||
      this.approvalsRequiredError ||
      this.wholeNumberError
    ) {
      return;
    }

    // if (!this.bank) {
    //   this.selectBankError = true;
    //   this.cdr.detectChanges();
    //   return;
    // }

    // if (!this.access) {
    //   this.selectAccessError = true;
    //   this.cdr.detectChanges();
    //   return;
    // }

    // this.removeOldErrors();
    this.bankAuthorizers.map((obj: any) => {
      if (this.selectedLevel === obj.level) {
        obj.approvalsRequired = this.approvalsRequired;
        // obj.access = this.access;
        // obj.bank = this.bank;
      }
    });

    let cleanData = this.cleanData(
      JSON.parse(JSON.stringify(this.bankAuthorizers))
    );

    for (let authorizer of cleanData) {
      if (authorizer.approvalsRequired === null) {
        this.detailsModal?.close();

        this.showLevelDetails(
          this.detailsTemplate,
          authorizer
          // authorizer.level as number,
          // authorizer.approvalsRequired
        );

        this.spinner.hide();
        this.cdr.detectChanges();
        return;
      }
    }

    this.detailsModal?.close();
    this.cdr.detectChanges();
  }

  /**
   * Arrange authorizer level wise and type wise
   */
  arrangeAuthorizers() {
    this.bankAuthorizers.sort((a: any, b: any) => {
      if (
        a.status === authorizerStatusConstant.inactive &&
        b.status === authorizerStatusConstant.active
      )
        return 1;
      if (
        a.status === authorizerStatusConstant.active &&
        b.status === authorizerStatusConstant.inactive
      )
        return -1;
      if (
        a.status === authorizerStatusConstant.active &&
        b.status === authorizerStatusConstant.active
      )
        return -1;
      if (
        a.status === authorizerStatusConstant.inactive &&
        b.status === authorizerStatusConstant.inactive
      )
        return -1;
    });
    this.bankAuthorizers.sort((a: any, b: any) => {
      if (a.status === authorizerStatusConstant.active) {
        return a.level - b.level;
      }
    });

    this.cdr.detectChanges();
  }

  //Delete unwanted data before API call
  cleanData(approvers: AuthorizerModel[]) {
    let authorizers = approvers;

    for (let authorizer of authorizers) {
      delete authorizer.deleted;
      delete authorizer._id;
      delete authorizer.createdAt;
      delete authorizer.updatedAt;
      // delete authorizer.status;
    }

    return authorizers;
  }

  /**
   * Add, delete and update authorizers
   */
  onSubmit() {
    this.removeOldErrors();
    if (this.accountId && this.accountStatus !== accountsStatus.ACTIVE) {
      this.accountStatusError = true;
      this.cdr.detectChanges();
      return;
    }
    this.spinner.show();

    let cleanData = this.cleanData(
      JSON.parse(JSON.stringify(this.bankAuthorizers))
    );

    for (let authorizer of cleanData) {
      if (
        authorizer.approvalsRequired === null ||
        authorizer.approvalsRequired === undefined
      ) {
        this.showLevelDetails(
          this.detailsTemplate,
          authorizer
          // authorizer.level as number,
          // authorizer.approvalsRequired
        );

        this.spinner.hide();
        this.cdr.detectChanges();
        return;
      }
    }

    const formData = {
      merchantAuthorizers: cleanData
    };

    this.merchantService
      .updateProfileDetails(this.merchantId, '', formData)
      .subscribe(
        (resp: any) => {
          if (resp.success) {
            this.bankAuthorizers = resp.result.merchantAuthorizers;
            this.authHistory = JSON.parse(
              JSON.stringify(resp.result.merchantAuthorizers)
            );
            if (resp.result.merchantAuthorizers.length > 0) {
              this.arrangeAuthorizers();
            }
            this.removeOldErrors();
            this.validLevelError = false;
            this.newLevelError = false;
            this.deletingAuthorizerEmail = '';
            this.authorizerForm.enable();
            this.disableAddButton = false;
            this.newAuthorizer = false;
            this.spinner.hide();
            this.cdr.detectChanges();
          }
        },
        error => {
          this.errors = error.error.errors;
          if (this.errors[0].includes('must be a valid email')) {
            let email = this.bankAuthorizers[
              parseInt(this.errors[0].slice(13, 14))
            ]['email'];
            this.errors = [];
            this.errors.unshift(email + ' must be a valid email');
          }
          this.showToast('Error', `${this.errors}`, {
            headerClasses: 'bg-danger text-white'
          });
          this.newAuthorizer = false;
          this.spinner.hide();
          this.cdr.detectChanges();
        },
        () => {
          // 'onCompleted' callback.
          // No errors, route to new page here
        }
      );

    this.updatingEmail = '';
    this.updatingAuthorizer = undefined;
    this.authorizerUpdateForm.reset();
    this.cdr.detectChanges();
  }

  removeOldErrors() {
    this.approvalsRequiredError = false;
    this.duplicateEmailError = false;
    this.newLevelError = false;
    this.validLevelError = false;
    this.validNameError = false;
    this.validMobileError = false;
    this.validApprovalsRequiredError = false;
    this.validEmailError = false;
    this.accountAuthError = false;
    this.merchantAuthError = false;
    this.incompleteFormError = false;
    this.zeroMemberError = false;
    this.lessMemberError = false;
  }

  //showTOast
  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 15000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }
}

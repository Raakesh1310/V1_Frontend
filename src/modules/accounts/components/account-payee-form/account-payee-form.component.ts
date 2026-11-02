import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalInfoComponent } from '@common/components/modal-info/modal-info.component';
import { UtilityService } from '@common/services';
import {
  AccountDescriptionDetail,
  AccountDescriptionRespModel,
  AccountPayeeDetail,
  AccountPayeeDraft
} from '@modules/accounts/models';
import {
  AccountPayeeService,
  AccountsService
} from '@modules/accounts/services';

import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services/toast.service';
import {
  NgbDateStruct,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProfileService } from '@modules/profile/services';
import { AuthService } from '@modules/auth/services';
import { BankInterface } from '@modules/auth/models/merchantProfile.model';
import payeeAccountType from 'config/payeeAccountType';
import { banksWithVPAAccess } from '@modules/accounts/constants/banks';
import autoTransferType from '@modules/accounts/constants/autoTransferType';

@Component({
  selector: 'sbpro-account-payee-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-payee-form.component.pug',
  styleUrls: ['account-payee-form.component.scss']
})
export class AccountPayeeFormComponent implements OnInit {
  /**
   * class variables
   */
  shareUnitSelected = false;
  selectedShare = '%';
  @Input() isAuto?: boolean;
  submitted = false;
  submitting = false;
  shareSum = 0;

  selectedPayee: any = null;
  errors: string[] = [];
  linkedPayees: any[] = [];
  linkedPayeeArray: Array<{}> = [];
  linkPayeeForm!: FormGroup;
  addingPayee = false;
  deletingPayee: number | null = null;
  editingPayee!: AccountPayeeDetail | null;
  toastHead = '';
  toastBody = '';
  /**
   * rxjs variables
   */
  unlinkedPayees: AccountPayeeDetail[] = [];
  linkedPayees$!: Observable<AccountPayeeDetail[]>;
  private _loadingList$ = new BehaviorSubject(false);

  model!: NgbDateStruct;
  modalRef?: NgbModalRef;

  banks!: BankInterface[];
  upiPayoutEnabled: boolean = false;

  @Input() autoTransferType!: string;
  @Input() autoScheduledAt!: string;

  /**
   * inward bindings
   */
  @Input() accountId = '';
  @Input() draftShareUnit = '%';
  @Input() currentTab?: number;
  @Input() isAutoTransfer?: boolean;
  @Input() viewMode = false;
  @Input() draftPayees: AccountPayeeDraft[] = [];
  @Input() readOnly = false;
  @Input() merchantId = '';
  @Input() isAdmin = false;
  @Input() retentionAmount = 0;
  @Input() isRetentionChecked = false;
  @Input() selectedBank!: string;
  @Input() accountStatus!: string;
  /**
   * outward boundings
   */
  @Output() emitCurrentTab: EventEmitter<number> = new EventEmitter<number>();
  @Output() emitAutoTransferType: EventEmitter<string> = new EventEmitter<
    string
  >();
  @Output() emitAutoScheduledAt: EventEmitter<string> = new EventEmitter<
    string
  >();
  @Output() emitRetention: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() emitRetentionAmount: EventEmitter<number> = new EventEmitter<
    number
  >();
  @Output() emitShareUnit: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitNextTab: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() emitUndraftPayee: EventEmitter<string> = new EventEmitter<string>();
  @Output() emitDraftPayee: EventEmitter<AccountPayeeDraft> = new EventEmitter<
    AccountPayeeDraft
  >();
  @Output() emitAutoTransfer: EventEmitter<boolean> = new EventEmitter<
    boolean
  >();
  @Output() emitCache: EventEmitter<
    AccountDescriptionDetail
  > = new EventEmitter<AccountDescriptionDetail>();
  @ViewChild('infoMessage', { static: true }) infoMessage?: ElementRef;
  @ViewChild('warningMessage', { static: true }) warningMessage?: ElementRef;

  enableUpdateBt = false;

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private accountsService: AccountsService,
    private modalService: NgbModal,
    private utilityService: UtilityService,
    private accountPayeeService: AccountPayeeService,
    private _location: Location,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
    private router: Router,
    private merchantProfileService: ProfileService,
    private authService: AuthService
  ) {
    localStorage.removeItem('account_bool');
    this.linkPayeeForm = this.formBuilder.group({
      payeeId: [null, Validators.required],
      email: [null, Validators.required],
      share: [null, Validators.required],
      name: [null, Validators.required]
    });
    this.isAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit() {
    // this.isAuto = this.isAutoTransfer;
    this.currentTab = 1;
    this.emitCurrentTab.emit(this.currentTab);
    /**
     * load all linked payees
     */

    this.linkPayeeForm.valueChanges.subscribe(data => {
      console.log('Form changes', data);
      this.checkFormValue(data)
        ? localStorage.setItem('account_bool', 'false')
        : localStorage.setItem('account_bool', 'true');
    });

    if (this.isAdmin) {
      this.merchantProfileService
        .getProfile(this.merchantId, false)
        .subscribe(resp => {
          this.banks = resp.result.banks;
          this.upiPayoutEnabled = resp.result.upiPayoutEnabled;
          this.getLinkedPayee();
        });
    } else {
      this.merchantProfileService.getProfile(null, false).subscribe(resp => {
        this.banks = resp.result.banks;
        this.upiPayoutEnabled = resp.result.upiPayoutEnabled;
        this.getLinkedPayee();
      });
    }

    this.cdr.detectChanges();
  }

  /**
   * get functions
   */
  getLinkedPayee() {
    this._loadingList$.next(true);
    this.accountPayeeService.getLinkedPayee(this.accountId, this.merchantId);
    this.accountPayeeService.payees$.subscribe(() => {
      this._loadingList$.next(false);
    });
    this.linkedPayees$ = this.accountPayeeService.payees$;
    this.linkedPayees$.subscribe(p => {
      if (_.isArray(p) && !_.isEmpty(p)) {
        this.linkedPayees = _.uniqBy(
          [...p, ...this.draftPayees],
          pay => pay.payeeId
        );
      } else {
        this.linkedPayees = _.uniqBy([...this.draftPayees], pay => pay.payeeId);
      }
      console.log('RESPONSE EMITTED ', this.linkedPayees);
      if (this.linkedPayees.length === 0) {
        localStorage.setItem('account_bool', 'true');
      }

      // only get all payees in case of rbl bank or other banks which have vpa otherwise get bankAccount payee type
      this.getUnlinkedPayee('');
      this.shareSum = this.linkedPayees.reduce((a, b: any) => a + b.share, 0);
      this.shareSum = Number.parseFloat(this.shareSum.toFixed(2));
      this.cdr.detectChanges();
    });
  }

  checkFormValue(data: any): boolean {
    for (let key in data) {
      if (data[key] !== null && data[key] !== '' && data[key] !== undefined) {
        return true;
      }
    }
    return false;
  }

  getUnlinkedPayee(term: string) {
    const bankHasVPAAccess = this.hasVPAAccess(this.selectedBank);
    const accountType = bankHasVPAAccess
      ? payeeAccountType.all
      : payeeAccountType.bankAccount;
    this._loadingList$.next(true);
    this.accountPayeeService.getUnlinkedPayee(
      this.accountId,
      term,
      this.merchantId,
      accountType
    );
    this.accountPayeeService.unlinkedPayees$.subscribe(resp => {
      this._loadingList$.next(false);
      this.unlinkedPayees = _.differenceBy(resp, this.linkedPayees, 'payeeId');
      this.cdr.detectChanges();
    });
  }

  get linkedLoading$() {
    return this.accountPayeeService.linkedLoading$;
  }

  get unlinkedLoading$() {
    return this.accountPayeeService.unlinkedLoading$;
  }

  /**
   * getter functions for form
   */
  get payeeId() {
    return this.linkPayeeForm.get('payeeId');
  }

  get share() {
    return this.linkPayeeForm.get('share');
  }

  enableUpdate() {
    this.enableUpdateBt = true;
    this.cdr.detectChanges();
  }

  /**
   * auto transfer checkbox
   */

  checkboxAction(checkbox: HTMLInputElement, content: ElementRef) {
    if (checkbox.checked) {
      this.enableUpdateBt = true;
      /**
       * if checkbox is checked
       */
      this.errors = [];
      if (this.draftShareUnit === 'INR') {
        /**
         * ERROR - Not %
         */
        this.errors.push(
          'Auto transfer feature only applicable when payout unit is in %'
        );
        checkbox.checked = false;
        return;
      }
      const modalRef = this.modalService.open(ModalInfoComponent, {
        backdrop: 'static',
        size: 'lg'
      });
      modalRef.componentInstance.doClose = modalRef;
      modalRef.componentInstance.passEntry.subscribe((resp: boolean) => {
        if (resp) {
          /**
           * ERROR - 100% share
           */
          if (this.shareSum !== 100) {
            this.errors.push(
              'To enable AUTO TRANSFER, please make payee share 100%.'
            );
            checkbox.checked = false;
            this.cdr.detectChanges();
            return;
          }
          this.isAutoTransfer = true;
          const formData = new FormData();
          formData.append('isAutoTransfer', this.isAutoTransfer.toString());
          this.accountsService
            .updateAccount(this.accountId, formData, this.merchantId)
            .subscribe(
              response => {
                this.submitting = false;
                if (response.success) {
                  this.emitAutoTransfer.emit(true);
                  return;
                }
                this.errors = response.errors;
                this.cdr.detectChanges();
                checkbox.checked = false;
              },
              err => {
                this.errors = err.error.errors;
                this.cdr.detectChanges();
              }
            );
        } else {
          this.emitAutoTransfer.emit(false);
          checkbox.checked = false;
        }
      });
    } else {
      /**
       * if checkbox is unchecked
       */
      this.isAutoTransfer = false;
      const formData = new FormData();
      formData.append('isAutoTransfer', this.isAutoTransfer.toString());
      this.accountsService
        .updateAccount(this.accountId, formData, this.merchantId)
        .subscribe(
          (resp: AccountDescriptionRespModel) => {
            this.submitting = false;
            if (resp.success) {
              this.emitAutoTransfer.emit(false);
              return;
            }
            this.errors = resp.errors;
            this.cdr.detectChanges();
            checkbox.checked = false;
          },
          err => {
            this.errors = err.error.errors;
            this.cdr.detectChanges();
          }
        );
    }
  }

  /**
   *
   * POST FUNCTIONS
   */

  updatePayee($event: any) {
    if (this.selectedPayee) {
      this.linkPayeeForm.controls.payeeId.setValue(this.selectedPayee.payeeId);
      this.linkPayeeForm.controls.email.setValue(this.selectedPayee.email);
      this.linkPayeeForm.controls.name.setValue(
        this.selectedPayee.accountHolder
      );
    } else {
      this.linkPayeeForm.reset();
    }
  }

  linkPayee() {
    this.errors = [];
    if (!this.linkPayeeForm.valid) {
      return;
    }
    if (this.draftShareUnit === '%') {
      if (
        this.shareSum > 100 ||
        Number(this.shareSum) +
          Number(this.linkPayeeForm.controls.share.value) >
          100
      ) {
        this.errors.push('Payout share cannot exceed 100%.');
        this.cdr.detectChanges();
        return;
      }
    } else {
      this.isAutoTransfer = false;
    }

    this.addingPayee = true;

    /**
     * make api hit here
     */
    this.accountPayeeService
      .linkPayee(
        { shareUnit: this.draftShareUnit, payee: this.linkPayeeForm.value },
        this.accountId,
        this.merchantId
      )
      .subscribe(
        (resp: any) => {
          this.addingPayee = false;
          if (resp.success) {
            localStorage.setItem('account_bool', 'false');
            console.log(resp.result);
            const payee = {
              accountPayeeId: resp.result.accountPayeeId,
              name: resp.result.accountHolder,
              email: resp.result.email,
              payeeId: resp.result.payeeId,
              share: resp.result.share,
              accountNumber: resp.result.accountNumber,
              bankName: resp.result.bankName,
              vpa: resp.result.vpa
            };

            this.emitDraftPayee.emit(payee);
            this.getLinkedPayee();
          } else {
            this.addingPayee = false;
            this.errors = resp.errors;
            this.cdr.detectChanges();
          }
        },
        err => {
          this.addingPayee = false;
          this.errors = err.error.errors;
          this.cdr.detectChanges();
        }
      );
    this.resetPayeeFrom();
  }

  resetPayeeFrom() {
    this.shareUnitSelected = true;
    this.selectedPayee = null;
    this.linkPayeeForm.reset();
    this.cdr.detectChanges();
  }

  openWarningModal(accountPayeeId: string, i: number) {
    this.modalRef = this.modalService.open(this.warningMessage, {
      backdrop: 'static'
    });
    this.modalRef.result.then(resp => {
      if (resp) {
        this.deletePayee(accountPayeeId, i);
      }
      this.modalRef?.close();
    });
  }

  deletePayee(accountPayeeId: string, i: number) {
    this.deletingPayee = i;
    let delPayee = this.draftPayees[i]
      ? this.draftPayees[i]
      : this.linkedPayees[i];
    this.accountPayeeService
      .deletePayee(this.accountId, accountPayeeId, this.merchantId)
      .subscribe(
        (resp: any) => {
          this.deletingPayee = null;
          if (resp.success) {
            // this.emitUndraftPayee.subscribe((it : any) => {
            //   console.log("RESPONSE EMITTED ",it);
            //   if(it.length === 0){
            //     localStorage.setItem('account_bool', 'true');
            //     console.log("FLAG ",localStorage.setItem('account_bool', 'true'));
            //   }
            // });
            if (delPayee.share > 0) {
              this.isAutoTransfer = false;
              this.isAuto = false;
            }
            this.checkboxAction(
              { checked: false } as HTMLInputElement,
              {} as ElementRef
            );
            this.emitAutoTransfer.emit(false);
            this.emitUndraftPayee.emit(accountPayeeId);
            this.modalRef?.close();
            this.getLinkedPayee();

            this.cdr.detectChanges();
          } else {
            console.log(resp);
            console.log('failed to delete payee');
          }
        },
        err => {
          this.deletingPayee = null;
          console.log(err.error.errors);
          this.errors = err.error.errors;
          this.cdr.detectChanges();
        }
      );
  }

  editPayee(accountpayeeId: string, i: number) {
    this.editingPayee = this.linkedPayees.filter(payee => {
      return payee.accountPayeeId === accountpayeeId;
    })[0];
    console.log(this.editingPayee);
    this.cdr.detectChanges();
    this.openModal();
  }

  editPayeeShare(accountPayeeId: string) {
    // this.editingPayee = i;
    this.accountPayeeService
      .updatePayeeShare(
        this.accountId,
        accountPayeeId,
        this.editingPayee!.share,
        this.merchantId
      )
      .subscribe(
        (resp: any) => {
          this.editingPayee = null;
          if (resp.success) {
            // this.emitUndraftPayee.emit(accountPayeeId);
            this.closeModal(true);
            this.getLinkedPayee();

            this.toastHead = 'Updated Payee share';
            this.toastBody = 'Payee share updated successfully.';

            this.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-success text-white'
            });
            this.cdr.detectChanges();
          } else {
            console.log(resp);
            console.log('failed to delete payee');
            this.closeModal(true);
            this.cdr.detectChanges();
          }
        },
        err => {
          this.editingPayee = null;
          this.closeModal(true);
          this.getLinkedPayee();
          console.log(err.error.errors);
          this.errors = err.error.errors;
          this.cdr.detectChanges();
        }
      );
  }

  showDetails(payeeId: string) {
    if (!this.isAdmin) {
      this.router.navigate([environment.urlPortalPrefix + '/payee/' + payeeId]);
    } else {
      this.router.navigate([environment.urlAdminPrefix + '/payee/' + payeeId], {
        queryParams: { merchantId: this.merchantId }
      });
    }
  }

  patchPayee() {
    const ids = this.draftPayees.map(payee => payee.accountPayeeId);
    this.accountPayeeService
      .patchPayee(this.accountId, ids, this.merchantId)
      .subscribe(
        (resp: any) => {
          if (resp.success) {
            this.emitDraftPayee.emit();
            this.getLinkedPayee();
          }
        },
        err => {
          console.log(err.error.errors);
          this.errors = err.error.errors;
          this.cdr.detectChanges();
        }
      );
  }

  emitShareunit() {
    this.emitShareUnit.emit(this.draftShareUnit);
  }

  /**
   * Set the Retention Amount
   * @param event
   */
  setRetentionAmount(event: Event) {
    this.retentionAmount = Number.parseFloat(
      (event.target as HTMLInputElement).value
    );
    console.log(this.retentionAmount);
    console.log(this.isRetentionChecked);
    this.cdr.detectChanges();
  }

  /**
   * Update Retention Checkbox
   * @param event
   */
  updateRetCheckBoxVal(event: Event) {
    this.isRetentionChecked = (event.target as HTMLInputElement).checked
      ? true
      : false;
    this.cdr.detectChanges();
  }

  nextForm(showToast = false) {
    if (this.linkedPayees.length < 1) {
      this.errors = ['Please add minimum 1 payee'];
      this.cdr.detectChanges();
      return;
    }
    //Check Retention value
    if (
      (this.retentionAmount <= 0 || !this.retentionAmount) &&
      this.isRetentionChecked
    ) {
      this.errors = ['Retention Amount should be greater than 0'];
      this.cdr.detectChanges();
      return;
    }
    //Update to Account if Retention Amount there
    if (this.isAutoTransfer) {
      const formData = new FormData();
  
      if (this.autoTransferType) {
          formData.append('autoTransferType', this.autoTransferType);
  
          if (!this.autoScheduledAt) {
              this.errors = ['Please select a Split Time.'];
              this.cdr.detectChanges();
              return;
          } else if (this.autoTransferType === autoTransferType.SCHEDULED) {
              formData.append('autoScheduledAt', this.autoScheduledAt);
          }
      } else {
          this.errors = ['Please select a Split Frequency.'];
          this.cdr.detectChanges();
          return;
      }
  
      console.log(this.retentionAmount, this.isRetentionChecked);
      this.emitRetention.emit(this.isRetentionChecked);
  
      if (this.retentionAmount > 0 && this.isRetentionChecked) {
          this.emitRetentionAmount.emit(this.retentionAmount);
          formData.append('retentionAmount', this.retentionAmount.toString());
      }
  
      this.emitAutoTransferType.emit(this.autoTransferType);
      this.emitAutoTransfer.emit(this.isAutoTransfer);
      this.emitAutoScheduledAt.emit(this.autoScheduledAt);
  
      this.accountsService.updateAccount(this.accountId, formData, this.merchantId).subscribe(
          (resp: AccountDescriptionRespModel) => {
              this.submitting = false;
              if (resp.success) {
                  if (this.enableUpdateBt) {
                      this.enableUpdateBt = false;
                      if (showToast) {
                          this.showToast('Success', 'Escrow Updated', {
                              headerClasses: 'bg-success text-white'
                          });
                      }
                      this.cdr.detectChanges();
                  }
                  return;
              }
              this.errors = resp.errors;
              this.cdr.detectChanges();
          },
          err => {
              this.errors = err.error.errors;
              this.cdr.detectChanges();
          }
      );
  }
  
    this.emitShareUnit.emit(this.draftShareUnit);
    this.emitNextTab.emit(true);
    this.cdr.detectChanges();
  }

  goBack() {
    this._location.back();
  }

  openModal() {
    this.modalRef = this.modalService.open(this.infoMessage, {
      backdrop: 'static',
      size: 'lg'
    });
  }

  closeModal(acceptance: boolean) {
    this.modalRef?.close(acceptance);
  }

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

  hasVPAAccess(bank: string) {
    return _.includes(banksWithVPAAccess, bank) && this.upiPayoutEnabled;
  }
}

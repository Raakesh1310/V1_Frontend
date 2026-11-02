import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from '@common/services';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services/toast.service';
import {
  NgbDateStruct,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '@modules/auth/services';
import { PartiesService } from '@modules/parties/services';
import { BankAccountService } from '@modules/bank-account/services';
import { NgxSpinnerService } from 'ngx-spinner';
import merchantUserRoles from 'config/merchantUserRoles';
import Party from '@modules/bank-account/models/party.model';
import { Location } from '@angular/common';

@Component({
  selector: 'sbpro-bank-account-escrow-parties',
  templateUrl: './bank-account-escrow-parties.component.pug',
  styleUrls: ['./bank-account-escrow-parties.component.scss']
})
export class BankAccountEscrowPartiesComponent implements OnInit {
  /**
   * class variables
   */
  shareUnitSelected = false;
  selectedShare = '%';
  shareSum = 0;
  selectedParty!: Party | null;
  errors: string[] = [];
  linkPartyForm!: FormGroup;
  addingParty = false;
  deletingParty: number | null = null;
  toastHead = '';
  toastBody = '';
  /**
   * rxjs variables
   */
  unlinkedParties!: Party[];

  model!: NgbDateStruct;
  modalRef?: NgbModalRef;

  linkedParties!: Party[];
  accountId = '';
  draftShareUnit = '%';
  readOnly = false;
  merchantId = '';
  isAdmin = false;
  bankAccountNo: string = '';

  @ViewChild('infoMessage', { static: true }) infoMessage?: ElementRef;
  @ViewChild('warningMessage', { static: true }) warningMessage?: ElementRef;

  roles: string[] = [];
  isMerchantAuthorizer = false;

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private partyService: PartiesService,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
    private bankAccountService: BankAccountService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private utilityService: UtilityService,
    private _location: Location,
  ) {
    localStorage.removeItem('account_bool');
    this.linkPartyForm = this.formBuilder.group({
      partyId: [null, Validators.required],
      bankAccountNo: [null, Validators.required],
      merchantId: [null, Validators.required],
      share: [null]
    });
    this.isAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(resp => {
      this.bankAccountNo = resp.get('accountId') || '';
    });

    if (this.isAdmin) {
      this.spinner.show();
      this.bankAccountService
        .fetchAccount(this.isAdmin, { bankAccountNo: this.bankAccountNo })
        .subscribe((resp: any) => {
          console.log(resp);
          if (resp.length > 0) {
            this.merchantId = resp[0].merchantId;
            this.partyService
              .getParties(this.isAdmin, this.merchantId, -1, '')
              .subscribe((resp: any) => {
                console.log(resp.result);
                this.unlinkedParties = resp.result;

                this.spinner.hide();
              });
          }
          this.cdr.detectChanges();
        });
    }

    this.getLinkedParties();
    this.checkForReadOnly();
    this.cdr.detectChanges();
  }

  checkForReadOnly() {
    this.roles = this.authService.getRole();

    this.isMerchantAuthorizer =
      this.roles?.indexOf(merchantUserRoles.MERCHANT_AUTHORIZER) > -1
        ? true
        : false;
    if (this.roles && this.isMerchantAuthorizer) {
      this.readOnly = true;
    }
  }

  /**
   * get functions
   */
  getLinkedParties() {
    this.errors = [];
    this.selectedShare = '';
    this.bankAccountService
      .getLinkedParty(this.isAdmin, this.bankAccountNo)
      .subscribe((resp: any) => {
        if (resp) {
          this.linkedParties = resp.result;
          if (this.linkedParties.length > 0) {
            // this.draftShareUnit = resp.result[0].shareUnit;
            this.shareSum = this.linkedParties.reduce(function(a: any, b: any) {
              return b.shareUnit !== 'no-limit'
                ? a + Number.parseFloat(b.share)
                : a;
            }, 0);
            this.shareSum = Number.parseFloat(this.shareSum.toFixed(2));
            if (this.linkedParties.length === 0) {
              this.selectedShare = '';
              this.draftShareUnit = '';
            } else if (
              this.linkedParties.find((p: any) => {
                return p.shareUnit === '%';
              })
            ) {
              this.selectedShare = '%';
              this.draftShareUnit = '%';
            } else if (
              this.linkedParties.find((p: any) => {
                return p.shareUnit === 'INR';
              })
            ) {
              this.selectedShare = 'INR';
              this.draftShareUnit = 'INR';
            }
          }
          this.cdr.detectChanges();
        }
      });
  }

  getParties(term: string) {
    this.partyService
      .getParties(this.isAdmin, this.merchantId, -1, term)
      .subscribe((resp: any) => {
        console.log(resp.result);
        this.unlinkedParties = resp.result;
      });
  }

  /**
   *
   * POST FUNCTIONS
   */

  updateParty($event: any) {
    if (this.selectedParty) {
      this.linkPartyForm.controls.merchantId.setValue(
        this.selectedParty.merchantId
      );
      this.linkPartyForm.controls.partyId.setValue(this.selectedParty.partyId);
      this.linkPartyForm.controls.bankAccountNo.setValue(
        this.selectedParty.accountNo
      );
    } else {
      this.linkPartyForm.reset();
    }
  }

  linkParty() {
    this.errors = [];
    if (!this.linkPartyForm.valid) {
      return;
    }

    // if (this.draftShareUnit === 'no-limit') {
    //   this.linkPartyForm.controls.share.setValue('');
    // } else if (!this.linkPartyForm.controls.share.value) {
    //   this.errors.push('Payout share is mandatory');
    //   this.cdr.detectChanges();
    //   return;
    // }

    if (
      this.linkedParties.find((p: any) => {
        return p.partyId === this.linkPartyForm.controls.partyId.value;
      })
    ) {
      this.errors.push('Party is already linked');
      this.cdr.detectChanges();
      return;
    }

    if (this.draftShareUnit === '%') {
      if (
        this.shareSum > 100 ||
        Number(this.shareSum) +
          Number(this.linkPartyForm.controls.share.value) >
          100
      ) {
        this.errors.push('Payout share cannot exceed 100%.');
        this.cdr.detectChanges();
        return;
      }
    }

    this.addingParty = true;

    /**
     * make api hit here
     */
    this.bankAccountService
      .linkParty({
        shareUnit: this.draftShareUnit,
        party: this.linkPartyForm.value,
        bankAccountNo: this.bankAccountNo,
        merchantId: this.merchantId
      })
      .subscribe(
        (resp: any) => {
          this.addingParty = false;
          if (resp.success) {
            localStorage.setItem('account_bool', 'false');
            console.log(resp.result);

            this.getLinkedParties();
          } else {
            this.addingParty = false;
            this.errors = resp.errors;
            this.cdr.detectChanges();
          }
        },
        err => {
          this.addingParty = false;
          this.errors = err.error.errors;
          this.cdr.detectChanges();
        }
      );
    this.resetPartyFrom();
  }

  resetPartyFrom() {
    this.shareUnitSelected = true;
    this.selectedParty = null;
    this.linkPartyForm.reset();
    this.cdr.detectChanges();
  }

  openWarningModal(escrowPartyId: string, i: number) {
    this.modalRef = this.modalService.open(this.warningMessage, {
      backdrop: 'static'
    });
    this.modalRef.result.then(resp => {
      if (resp) {
        this.deleteParty(escrowPartyId, i);
      }
      this.modalRef?.close();
    });
  }

  deleteParty(escrowPartyId: string, i: number) {
    this.bankAccountService.deleteParty(escrowPartyId).subscribe(
      (resp: any) => {
        this.deletingParty = null;
        if (resp.success) {
          this.modalRef?.close();
          this.getLinkedParties();

          this.cdr.detectChanges();
        } else {
          console.log(resp);
          console.log('failed to delete payee');
        }
      },
      err => {
        this.deletingParty = null;
        console.log(err.error.errors);
        this.errors = err.error.errors;
        this.cdr.detectChanges();
      }
    );
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

  goBack() {
    this._location.back();
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OtpModalComponent } from '@common/components';
import { AuthService } from '@modules/auth/services';
import { DealDocument, DealParty } from '@modules/deal/models';
import { DealService } from '@modules/deal/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import smsMsg91TemplateId from 'config/smsMsg91TemplateId';

@Component({
  selector: 'sbpro-payment-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-details.component.pug',
  styleUrls: ['payment-details.component.scss']
})
export class PaymentDetailsComponent implements OnInit {
  @Input() private doClose: any;
  @Input() private deal: DealDocument = {} as DealDocument;
  @Input() private otpModal?: NgbModalRef;
  @Input() private claimModal?: NgbModalRef;

  claimForm: FormGroup;
  claimErrors: string[] = [];
  verificationEntry: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private modalService: NgbModal,
    private dealService: DealService,
    private cdr: ChangeDetectorRef
  ) {
    this.claimForm = this.formBuilder.group({
      amount: [null, Validators.required],
      reason: [null, Validators.required]
    });
  }

  get amount() {
    return this.claimForm.controls.amount.value;
  }

  ngOnInit() {
    console.log(this.deal.verification);
    const claimEntry = this.deal.verification.filter((x: any) => {
      if (!x.verified) {
        if (x.data.paymentType === 'claim') {
          return x;
        }
      }
    })[0];
    const refundEntry = this.deal.verification.filter((x: any) => {
      if (!x.verified) {
        if (x.data.paymentType === 'refund') {
          return x;
        }
      }
    })[0];
    this.verificationEntry = claimEntry || refundEntry;
  }

  getMyRole(parties: DealParty[]) {
    return parties.filter((party: DealParty) => {
      return party.email === this.authService.getEmail();
    });
  }

  getMyParty(parties: DealParty[], email: string) {
    return parties.filter((party: DealParty) => {
      return party.email === email;
    });
  }

  approve(type: string) {
    this.otpModal = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    this.otpModal.componentInstance.doClose = this.otpModal;
    this.otpModal.componentInstance.templateId =
      smsMsg91TemplateId.registerMobileOtp;
    this.otpModal.componentInstance.passOtp.subscribe((otp: number) => {
      if (otp) {
        if (type === 'refund') {
          console.log('refund');
          this.dealService.approveRefund(this.deal, otp.toString()).subscribe(
            resp => {
              console.log(resp);
              if (resp.success) {
                this.close();
                return;
              }
            },
            err => {
              console.log(err);
            }
          );
        } else {
          console.log('claim');
          this.dealService.approveClaim(this.deal, otp.toString()).subscribe(
            resp => {
              console.log(resp);
              if (resp.success) {
                this.close();
              }
            },
            err => {
              console.log(err);
            }
          );
        }
      } else {
        console.log('something went with modal');
      }
    });
  }

  reject(type: string) {
    this.otpModal = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    this.otpModal.componentInstance.doClose = this.otpModal;
    this.otpModal.componentInstance.templateId =
      smsMsg91TemplateId.registerMobileOtp;
    this.otpModal.componentInstance.passOtp.subscribe((otp: number) => {
      if (otp) {
        if (type === 'refund') {
          this.dealService.rejectRefund(this.deal, otp.toString()).subscribe(
            resp => {
              console.log(resp);
              if (resp.success) {
                this.close();
              }
            },
            err => {
              console.log(err);
            }
          );
        } else {
          this.dealService.rejectClaim(this.deal, otp.toString()).subscribe(
            resp => {
              console.log(resp);
              if (resp.success) {
                this.close();
              }
            },
            err => {
              console.log(err);
            }
          );
        }
      } else {
        console.log('something went with modal');
      }
    });
  }
  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.claimErrors.push('Please enter a valid ' + name);
      }
    }
  }
  claim(modal: HTMLElement) {
    this.claimModal = this.modalService.open(modal, {
      backdrop: 'static',
      size: 'md'
    });
  }

  openOTP() {
    console.log(this.claimForm.value);

    if (
      this.claimForm.controls.amount.value > this.deal.dealData.securityDeposit
    ) {
      this.claimErrors.push('Claim cannot exceed security deposit amount');
      this.cdr.detectChanges();
      return;
    }
    if (!this.claimForm.valid) {
      this.findInvalidControls(this.claimForm);
      return;
    }
    this.claimModal?.close();
    console.log(this.claimForm.value);

    this.otpModal = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    this.otpModal.componentInstance.doClose = this.otpModal;
    this.otpModal.componentInstance.templateId =
      smsMsg91TemplateId.registerMobileOtp;
    this.otpModal.componentInstance.passOtp.subscribe((otp: number) => {
      if (otp) {
        console.log(this.claimForm.value);
        this.dealService
          .initClaim(this.deal, this.claimForm.value, otp.toString())
          .subscribe(
            resp => {
              console.log(resp);
              this.close();
            },
            err => {
              console.log(err.error.errors);
            }
          );
      } else {
        console.log('something went with modal');
      }
    });
  }

  close() {
    console.log('closing modal');
    this.claimForm.reset();
    this.doClose.close();
  }
}

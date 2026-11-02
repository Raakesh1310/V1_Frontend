import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { OtpModalComponent } from '@common/components';
import { AuthService } from '@modules/auth/services';
import dealConstants from '@modules/deal/constants/dealConstants';
import dealStatusConstants from '@modules/deal/constants/dealStatusConstants';
import { Deal, DealDocument, DealParty } from '@modules/deal/models';
import { DealService } from '@modules/deal/services';
import {
  NgbCalendar,
  NgbDate,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import smsMsg91TemplateId from 'config/smsMsg91TemplateId';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

import { PaymentDetailsComponent } from '../payment-details/payment-details.component';

@Component({
  selector: 'sbpro-deal-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deal-list.component.pug',
  styleUrls: ['deal-list.component.scss']
})
export class DealListComponent implements OnInit {
  @Input() isSuperAdmin = false;
  @Input() pageSize = 10;
  deal$!: Observable<DealDocument[]>;
  total$!: Observable<number>;
  private _loadingList$ = new BehaviorSubject(false);
  selectedDeal: DealDocument = {} as DealDocument;
  modalRef?: NgbModalRef;
  claimModalRef?: NgbModalRef;
  refundModalRef?: NgbModalRef;
  warningModalRef?: NgbModalRef;
  paymentModalRef?: NgbModalRef;
  claimModal?: NgbModalRef;
  filtersVisible = true;
  claimForm: FormGroup;
  claimErrors: string[] = [];
  @ViewChild('claimTemplate')
  private claimTemplate!: TemplateRef<any>;
  detailError: string[] = [];
  balanceError = '';

  dealStatusConstants = dealStatusConstants;
  statusList = Object.values(dealStatusConstants);

  docUrlPrefix = environment.apiHost + '/uploads/deals/';
  claimCheck = false;

  constructor(
    public dealService: DealService,
    private modalService: NgbModal,
    public authService: AuthService,
    public changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private calendar: NgbCalendar,
    private formBuilder: FormBuilder
  ) {
    this.claimForm = this.formBuilder.group({
      amount: [0],
      reason: ['']
    });
  }

  get amount() {
    return this.claimForm.controls.amount.value;
  }

  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }

  toggleFilters() {
    this.filtersVisible = !this.filtersVisible;
  }

  isCreator(deal: Deal) {
    return deal.createdBy === this.authService.getEmail();
  }

  editDeal(dealId: string) {
    this.router.navigate(['/portal/deal/edit/' + dealId]);
  }

  getMyRole(parties: DealParty[]) {
    return parties.filter((party: DealParty) => {
      return party.email === this.authService.getEmail();
    });
  }

  ngOnInit() {
    this.dealService.isSuperAdmin = this.isSuperAdmin;

    // this.accountsService.retrieveData();
    // this.accountsService.performSearch();
    this.dealService.pageSize = this.pageSize;
    this.deal$ = this.dealService._deals$;
    this.total$ = this.dealService.total$;
    this.loadData();
  }

  async loadData() {
    this._loadingList$.next(true);
    this.dealService.retrieveData().subscribe(resp => {
      this._loadingList$.next(false);
    });
  }

  submitSearchForm() {
    this.dealService.page = 1;
    console.log('Submitting Search Form');
    // Reload the data
    this.dealService.retrieveData().subscribe();
  }

  clearForm() {
    console.log('clearing form');
    // tslint:disable-next-line:no-any
    this.dealService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    // tslint:disable-next-line:no-any
    this.dealService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.dealService.pageSize = 10;
    this.dealService.searchTerm = '';
    this.dealService.status = '';
    this.loadData();
  }

  updateStatus($event: string) {
    this.dealService.status = $event;
  }

  viewDeal(deal: any, modal: HTMLElement) {
    if (this.isSuperAdmin) {
      this.router.navigate([
        environment.urlAdminPrefix + '/deal/' + deal.dealId
      ]);
      return;
    }
    this.detailError = [];
    this.selectedDeal = deal;
    this.modalRef = this.modalService.open(modal, {
      size: 'lg'
    });
  }

  viewApproval(deal: any, modal: HTMLElement) {
    this.selectedDeal = deal;
    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      size: 'lg'
    });
  }

  approve(dealId: string) {
    const otpmodalRef: NgbModalRef & {
      componentInstance: OtpModalComponent;
    } = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    otpmodalRef.componentInstance.doClose = otpmodalRef;
    otpmodalRef.componentInstance.templateId =
      smsMsg91TemplateId.registerMobileOtp;
    otpmodalRef.componentInstance.passOtp.subscribe((otp: number) => {
      if (otp) {
        this.dealService.approveDeal(dealId, otp.toString()).subscribe(
          resp => {
            console.log(resp);
            this.modalRef?.close();
            this.loadData();
          },
          err => {
            console.log(err);
            this.detailError = err.error.errors;
            this.changeDetectorRef.detectChanges();
          }
        );
      } else {
        console.log('something went wrong with modal');
      }
    });
  }

  reject(dealId: string) {
    const otpmodalRef: NgbModalRef & {
      componentInstance: OtpModalComponent;
    } = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    otpmodalRef.componentInstance.doClose = otpmodalRef;
    otpmodalRef.componentInstance.templateId =
      smsMsg91TemplateId.registerMobileOtp;
    otpmodalRef.componentInstance.passOtp.subscribe((otp: number) => {
      if (otp) {
        this.dealService.rejectDeal(dealId, otp.toString()).subscribe(
          resp => {
            console.log(resp);
            this.modalRef?.close();
            this.loadData();
          },
          err => {
            console.log(err);
            this.detailError = err.error.errors;
            this.changeDetectorRef.detectChanges();
          }
        );
      } else {
        console.log('something went wrong with modal');
      }
    });
  }

  openWarning(modal: HTMLElement) {
    this.warningModalRef = this.modalService.open(modal, {
      backdrop: 'static',
      size: 'sm'
    });
  }

  initiateRefund(otp: string) {
    this.dealService.initRefund(this.selectedDeal, otp).subscribe(
      resp => {
        console.log(resp);
        if (resp.success) {
          this.loadData();
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  makePayment(deal: DealDocument) {
    this.selectedDeal = deal;
    if (
      this.selectedDeal.account.balance <
      this.selectedDeal.dealData.securityDeposit
    ) {
      this.balanceError =
        'Payment cannot be initiated as deal balance is less than security deposit.';

      this.changeDetectorRef.detectChanges();
      return;
    }

    this.modalRef?.close();
    if (
      this.getMyRole(this.selectedDeal.dealParties)[0].role ===
      dealConstants.LANDLORD
    ) {
      this.claimCheck = false;
      this.claimForm.reset();
      this.claim(this.claimTemplate);
    } else {
      this.refundModalRef = this.modalService.open(OtpModalComponent, {
        backdrop: 'static',
        size: 'md'
      });
      this.refundModalRef.componentInstance.doClose = this.refundModalRef;
      this.refundModalRef.componentInstance.templateId =
        smsMsg91TemplateId.registerMobileOtp;
      this.refundModalRef.componentInstance.passOtp.subscribe((otp: number) => {
        if (otp) {
          this.initiateRefund(otp.toString());
        } else {
          console.log('something went with modal');
        }
      });
    }
  }

  claim(modal: TemplateRef<any>) {
    this.claimModal = this.modalService.open(modal, {
      backdrop: 'static',
      size: 'md'
    });
  }

  viewPayment(deal: DealDocument) {
    this.paymentModalRef = this.modalService.open(PaymentDetailsComponent, {
      backdrop: 'static',
      size: 'xl'
    });
    this.paymentModalRef.componentInstance.doClose = this.paymentModalRef;
    this.paymentModalRef.componentInstance.deal = deal;
    this.paymentModalRef.result.then(resp => {
      this.loadData();
    });
  }

  openOTP() {
    if (!this.claimCheck) {
      this.claimForm.controls.amount.setValue(0);
      this.claimForm.controls.reason.setValue('claim');
    }

    if (
      this.claimForm.controls.amount.value >
      this.selectedDeal.dealData.securityDeposit
    ) {
      this.claimErrors.push('Claim cannot exceed security deposit amount');
      this.changeDetectorRef.detectChanges();
      return;
    }
    this.claimModal?.close();
    this.modalRef = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    this.modalRef.componentInstance.doClose = this.modalRef;
    this.modalRef.componentInstance.templateId =
      smsMsg91TemplateId.registerMobileOtp;
    this.modalRef.componentInstance.passOtp.subscribe((otp: number) => {
      if (otp) {
        console.log(this.claimForm.value);
        this.dealService
          .initClaim(this.selectedDeal, this.claimForm.value, otp.toString())
          .subscribe(resp => {
            console.log(resp);
            if (resp.success) {
              this.paymentModalRef?.close();
              this.loadData();
            }
          });
      } else {
        console.log('something went with modal');
      }
    });
  }

  dealDetails(dealId: string) {
    this.router.navigate([environment.urlPortalPrefix + '/deal/' + dealId, {}]);
  }
}

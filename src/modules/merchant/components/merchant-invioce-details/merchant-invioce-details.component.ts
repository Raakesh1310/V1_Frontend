import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from '@common/services';
import { feeTypesNameAssociation } from '@modules/merchant/constants/feeNameAssociations.constant';
import { FeeService, MerchantService } from '@modules/merchant/services';
import { ProfileService } from '@modules/profile/services';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { depositFeeConstant } from '../../constants/merchant-fee.constant';

const feeTypes = {
  setUpFee: 'One Time Set-Up Fee',
  virtualAccount: 'Escrow Fee',
  transaction: 'Transaction Fee',
  monthly: 'Monthly Fee',
  kycIndividual: 'KYC Individual Fee',
  kycBusiness: 'KYC Business Fee',
  imps: 'IMPS Fee',
  pennyTestFee: 'Penny Test Fee',
  miscellaneousFee: 'Miscellaneous Fees',
  escrowPage: 'Escrow Page Fee',
  depositFee: 'Deposit Fee',
  upiPayout: 'UPI Payout'
};

@Component({
  selector: 'sbpro-merchant-invioce-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './merchant-invoice-details-new.component.pug',
  styleUrls: ['merchant-invioce-details.component.scss']
})
export class MerchantInvioceDetailsComponent implements OnInit {
  @ViewChild('AddSingleFeeModal', { static: false })
  addSingleFeeModal!: TemplateRef<void>;
  @ViewChild('MiscellaneousFeeModal', { static: false })
  miscellaneousFeeModal!: TemplateRef<void>;
  @ViewChild('VirtualAccountOrTransactionFeeModal', { static: false })
  virtualAccountOrTransactionModal!: TemplateRef<void>;
  @ViewChild('EscrowPageFeeModal', { static: false })
  escrowPageFeeModal!: TemplateRef<void>;
  @ViewChild('DepositFeeModal', { static: false })
  depositFeeModal!: TemplateRef<void>;

  @ViewChild('UPIPayoutFeesModal', { static: false })
  upiPayoutFeeModal!: TemplateRef<void>;

  @ViewChild('EscrowPageFeeDetails', { static: false })
  escrowPageFeeDetails!: TemplateRef<void>;

  @ViewChild('DepositFeeDetails', { static: false })
  depositFeeDetails!: TemplateRef<void>;

  @ViewChild('UPIPayoutFeeDetails', { static: false })
  upiPayoutFeeDetails!: TemplateRef<void>;

  miscellanousFeeList!: FormArray;
  depositFeeList!: FormArray;
  feeDetailForm!: FormGroup;
  errors: string[] = [];
  @Input() merchantId = '';
  @Input() readOnly = '';
  toastHead = '';
  toastBody = '';
  showIMPS = false;
  showKYC = false;
  escrowPagePG = false;
  escrowFeePerPage = false;
  escrowFeePertransaction = false;
  showPennyTest = false;
  miscellanousFeeError = false;
  depositFeeError = false;
  depositPercentError = false;
  depositFeeRangeError = false;
  depositFeeOverlapError = false;
  misAmountError = false;
  upiFeeSettingFixedAmount = true;
  nbFeeSettingFixedAmount = true;
  dbFeeSettingFixedAmount = true;
  hasChanged = false;
  // new fee details section
  count = 0;
  feeType = '';
  fees = [];
  feeAmount = '';
  modalRef: NgbModalRef | null = null;
  _adding$ = new BehaviorSubject(false);
  showSetupFee: boolean = true;
  miscellaneousFeeForm!: FormGroup;
  // virtualFeeForm!: FormGroup;
  virtualOrTransactionFeeForm!: FormGroup;
  escrowPageFeeForm!: FormGroup;
  depositFees!: FormGroup;
  upiPayoutFees!: FormGroup;
  feeDetails: any;
  totalCount: number = 0;
  _page: number = 1;
  pageSize: number = 1;
  modalRefSub$ = new BehaviorSubject<Promise<any> | undefined>(undefined);
  startDateMin!: NgbDateStruct;
  showUpiPayoutFees!: boolean;

  get page() {
    return this._page;
  }
  set page(page: number) {
    this._page = page;
    this.loadFees(this._page);
  }

  private _loading$ = new BehaviorSubject(false);
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  constructor(
    private formBuilder: FormBuilder,
    private merchantService: MerchantService,
    private profileService: ProfileService,
    private utilityService: UtilityService,
    private feeService: FeeService,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private calendar: NgbCalendar,
    private modalService: NgbModal
  ) {
    const dNow = new Date();
    this.startDateMin = calendar.getNext(
      new NgbDate(dNow.getFullYear(), dNow.getMonth() + 1, dNow.getDate()),
      'd',
      0
    );

    this.feeDetailForm = this.formBuilder.group({
      setUpFee: [null, Validators.required],
      virtualAccountFeeSetting: [null, Validators.required],
      virtualAccountFee: [null, Validators.required],
      transactionFeeSetting: [null, Validators.required],
      transactionFee: [null, Validators.required],
      monthlyFee: [null, Validators.required],
      isPaymentGateway: [false],
      kycIndividualFee: [null],
      kycBusinessFee: [null],
      impsFee: [null],
      pennyTestFee: [null],
      miscellanousFees: this.formBuilder.array([]),
      depositFees: this.formBuilder.array([]),
      escrowFeePerPage: [false],
      escrowFeePerPageFee: [null, Validators.required],
      escrowFeePerTransaction: [false],
      escrowFeePerTransactionFee: [null, Validators.required],
      upiFeeSetting: [null, Validators.required],
      upiFeeAmount: [null, Validators.required],
      netBankingFeeSetting: [null, Validators.required],
      netBankingFeeAmount: [null, Validators.required],
      debitCardFeeSetting: [null, Validators.required],
      debitCardFeeAmount: [null, Validators.required]
    });

    this.miscellaneousFeeForm = this.formBuilder.group({
      feeName: [null, Validators.required],
      frequency: [null, Validators.required],
      amount: [null, Validators.required],
      effectiveDate: [null, Validators.required]
    });

    this.virtualOrTransactionFeeForm = this.formBuilder.group({
      feeSetting: [null, Validators.required],
      feeAmount: [null, Validators.required]
    });

    this.miscellanousFeeList = this.feeDetailForm.get(
      'miscellanousFees'
    ) as FormArray;

    // this.depositFeeList = this.feeDetailForm.get('depositFees') as FormArray;

    this.escrowPageFeeForm = this.formBuilder.group({
      perPage: [false, Validators.required],
      perPageAmount: [null, Validators.required],
      perTransaction: [false, Validators.required],
      perTransactionAmount: [null, Validators.required],

      upiFeeSetting: ['', Validators.required],
      upiFeeAmount: [null, Validators.required],

      nbFeeSetting: ['', Validators.required],
      nbFeeAmount: [null, Validators.required],

      dbFeeSetting: ['', Validators.required],
      dbFeeAmount: [null, Validators.required]
    });

    this.depositFees = this.formBuilder.group({
      depositFeeEntries: this.formBuilder.array([]),
      aboveAmount: ['', Validators.required],
      abovePercentage: [0, Validators.required]
    });

    this.upiPayoutFees = this.formBuilder.group({
      upiPayoutFeeEntries: this.formBuilder.array([]),
      aboveAmount: [25000.01, Validators.required],
      aboveAmountFee: ['', Validators.required]
    });

    this.modalRefSub$.subscribe(val => {
      if (!val) return;

      (val as Promise<any>).finally(() => {
        this.feeType = '';
        this.feeAmount = '';
        this.depositFees.reset();
        while (this.depositFeeEntries.length !== 1) {
          this.removeDepositFeeEntry(0);
        }
        this.escrowPageFeeForm.reset();
        this.miscellaneousFeeForm.reset();
        this.virtualOrTransactionFeeForm.reset();
        this.resetUpiPayoutFeeForm();
        this.cdr.detectChanges();
      });
    });
  }

  get depositFeeEntries(): FormArray {
    return this.depositFees.get('depositFeeEntries') as FormArray;
  }

  get upiPayoutFeeEntries(): FormArray {
    return this.upiPayoutFees.get('upiPayoutFeeEntries') as FormArray;
  }

  private populateUpiPayoutFeeSlabs() {
    const feeSlabs = [
      { startAmount: 0, endAmount: 1000 },
      { startAmount: 1000.01, endAmount: 25000 }
    ];

    for (let feeSlab of feeSlabs) {
      this.upiPayoutFeeEntries.push(
        this.formBuilder.group({
          startRange: [feeSlab.startAmount],
          endRange: [feeSlab.endAmount],
          amount: ['', Validators.required]
        })
      );
    }
  }

  private resetUpiPayoutFeeForm() {
    ((this.upiPayoutFees.controls.upiPayoutFeeEntries as FormArray)
      .controls as FormGroup[]).forEach((control: FormGroup) => {
      control.controls.amount.setValue('');
    });
    this.upiPayoutFees.controls.aboveAmountFee.setValue('');
  }

  formatUpdatedAtString(dateStr: string) {
    const date = new Date(dateStr);
    if (!dateStr || Number.isNaN(date.getMonth())) return '--';

    return new Date(dateStr).toLocaleDateString('en-UK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  newDepositFeeEntry(
    startValue: number | null = null,
    endValue: number | null,
    percentage: number | null
  ): FormGroup {
    return this.formBuilder.group({
      startRange: [startValue, Validators.required],
      endRange: [endValue, Validators.required],
      percentage: [percentage, Validators.required]
    });
  }

  /**
   * adds an entry to depositFeeEntries
   */
  addDepositFeeEntry() {
    this.removeOldErrors();

    if (this.depositFeeEntries.length >= 100) {
      this.errors.push('Reached Max Limit.');
      return;
    }

    let startValue = null;
    if (this.depositFeeEntries.length) {
      const endRange = Number.parseFloat(
        (this.depositFeeEntries.controls as any)[
          this.depositFeeEntries.controls.length - 1
        ].controls.endRange.value
      );

      if (Number.isNaN(endRange)) {
        this.errors.push('Please fill the ranges');
        this.cdr.detectChanges();
        return;
      }

      startValue = endRange + 1;
    }

    this.depositFeeEntries.push(
      this.newDepositFeeEntry(startValue, null, null)
    );
    this.cdr.detectChanges();
  }

  /**
   * removes an entry from deposit fee entries at a given index
   * @param index
   */
  removeDepositFeeEntry(index: number) {
    this.removeOldErrors();
    this.depositFeeEntries.removeAt(index);
    this.cdr.detectChanges();
  }

  /**
   * Checks if there is an overlap in the entries of deposit fee
   */
  checkDepositFeeOverlap() {
    this.removeOldErrors();

    let error = false;

    let lastValue = -1;
    this.depositFeeEntries.controls.forEach((entry: any) => {
      if (
        lastValue < Number.parseFloat(entry.controls.startRange.value) &&
        Number.parseFloat(entry.controls.startRange.value) <
          Number.parseFloat(entry.controls.endRange.value)
      ) {
      } else {
        error = true;
      }

      lastValue = Number.parseFloat(entry.controls.endRange.value);
    });

    const lastEntry = Number.parseFloat(
      this.depositFeeEntries.value[this.depositFeeEntries.length - 1].endRange
    );

    if (lastEntry >= Number.parseFloat(this.depositFees.value.aboveAmount)) {
      error = true;
    }

    if (error) {
      this.errors.push('There is an overlap between ranges.');
    }

    this.cdr.detectChanges();
  }

  depositFeeChanges() {
    // get the last entry in deposit entries
    const lastEntry = this.depositFeeEntries.controls[
      this.depositFeeEntries.controls.length - 1
    ] as FormGroup;

    if (!lastEntry) return;

    const endRange = (
      Number.parseFloat(lastEntry.controls.endRange.value) + 0.01
    ).toFixed(2);

    this.depositFees.get('aboveAmount')?.setValue(endRange);
  }

  ngOnInit() {
    this.profileService
      .getProfile(this.merchantId, false)
      .subscribe((resp: any) => {
        if (resp.result) {
          console.log(resp.result);
          this.mapFees(resp);
          this.showUpiPayoutFees = resp.result.upiPayoutEnabled;
        }

        this.cdr.detectChanges();
      });

    this.loadFees();
    this.addDepositFeeEntry();

    this.depositFeeEntries.valueChanges.subscribe(() => {
      this.depositFeeChanges();
    });

    this.populateUpiPayoutFeeSlabs();
  }

  /**
   * Fetches fees with the give page number
   */
  loadFees(page: number = 1) {
    this.feeService.fetchFees(this.merchantId, this.page).subscribe(
      (resp: any) => {
        const fees = resp.result.fees.map((fee: any, idx: number) => ({
          id: idx + this.count,
          markedForDeletion: false,
          ...fee
        }));

        this.fees = fees as any;
        this.count = this.fees.length - 1;
        this.totalCount = Number.parseInt(resp.result.itemsCount);

        // if(_.isArray(resp.result))
        resp.result.fees.forEach((fee: any) => {
          if (fee.feeType === 'Setup Fee') {
            this.showSetupFee = false;
          }
        });

        this.cdr.detectChanges();
      },

      (err: HttpErrorResponse) => {
        console.log(err);
        this.utilityService.showToast('Error', err.error.errors[0], {
          headerClasses: 'bg-success text-white'
        });
      }
    );
  }

  /**
   * Opens fee addition modal
   * @param feeType
   * @returns
   */
  openFeeModal(feeType: string) {
    this.removeOldErrors();

    if (!feeType || feeType === '') return;
    this.feeType = feeType;
    this.cdr.detectChanges();

    if (feeType === 'miscellaneousFee')
      this.modalRef = this.modalService.open(this.miscellaneousFeeModal) as any;
    else if (feeType === 'transaction' || feeType === 'virtualAccount')
      this.modalRef = this.modalService.open(
        this.virtualAccountOrTransactionModal
      ) as any;
    else if (feeType === 'escrowPage')
      this.modalRef = this.modalService.open(this.escrowPageFeeModal) as any;
    else if (feeType === 'depositFee')
      this.modalRef = this.modalService.open(this.depositFeeModal, {
        size: 'lg'
      }) as any;
    else if (feeType === 'upiPayout')
      this.modalRef = this.modalService.open(this.upiPayoutFeeModal, {
        size: 'lg'
      }) as any;
    else this.modalRef = this.modalService.open(this.addSingleFeeModal) as any;
    this.modalRefSub$.next(this.modalRef?.result);
  }

  editFee(fee: any) {
    const feeType = (feeTypesNameAssociation as any)[fee.feeType];
    this.feeType = feeType;

    if (feeType === 'miscellaneousFee') {
      console.log(fee.details.feeName);
      this.miscellaneousFeeForm.get('feeName')?.setValue(fee.details.feeName);
      this.miscellaneousFeeForm.controls.frequency.setValue(
        fee.details.frequency
      );
      this.miscellaneousFeeForm.controls.amount.setValue(fee.details.amount);
      this.miscellaneousFeeForm.controls.effectiveDate.setValue(
        fee.details.effectiveDate
      );
      this.cdr.detectChanges();
    } else if (feeType === 'transaction') {
      this.virtualOrTransactionFeeForm.controls.feeAmount.setValue(fee.amount);
      this.virtualOrTransactionFeeForm.controls.feeSetting.setValue(
        fee.frequency === 'Pay As You Go' ? 'pay-as-you-go' : 'fixed-amount'
      );
    } else if (feeType === 'virtualAccount') {
      this.virtualOrTransactionFeeForm.controls.feeAmount.setValue(fee.amount);
      this.virtualOrTransactionFeeForm.controls.feeSetting.setValue(
        fee.frequency === 'Pay As You Go' ? 'pay-as-you-go' : 'one-time'
      );
    } else if (feeType === 'escrowPage') {
      console.log(fee);
      this.escrowPageFeeForm.controls.perPage.setValue(fee.details.perPage);
      this.escrowPageFeeForm.controls.perPageAmount.setValue(
        fee.details.perPageAmount
      );
      this.escrowPageFeeForm.controls.perTransaction.setValue(
        fee.details.perTransaction
      );
      this.escrowPageFeeForm.controls.upiFeeAmount.setValue(
        fee.details.perTransactionFeeDetails.upi.feeAmount
      );
      this.escrowPageFeeForm.controls.upiFeeSetting.setValue(
        fee.details.perTransactionFeeDetails.upi.feeSetting
      );

      this.escrowPageFeeForm.controls.nbFeeAmount.setValue(
        fee.details.perTransactionFeeDetails.netBanking.feeAmount
      );
      this.escrowPageFeeForm.controls.nbFeeSetting.setValue(
        fee.details.perTransactionFeeDetails.netBanking.feeSetting
      );

      this.escrowPageFeeForm.controls.dbFeeAmount.setValue(
        fee.details.perTransactionFeeDetails.debitCard.feeAmount
      );
      this.escrowPageFeeForm.controls.dbFeeSetting.setValue(
        fee.details.perTransactionFeeDetails.debitCard.feeSetting
      );
    } else if (feeType === 'depositFee') {
      const feeDetails = fee.details;

      while (this.depositFeeEntries.length !== 0) {
        this.removeDepositFeeEntry(0);
      }

      feeDetails.forEach((entry: any) => {
        this.depositFeeEntries.push(
          this.newDepositFeeEntry(
            entry.startRange,
            entry.endRange,
            entry.percentage
          )
        );
      });

      // remove the last entry because it contains only above value
      this.removeDepositFeeEntry(this.depositFeeEntries.length - 1);
      const lastEntry = feeDetails[feeDetails.length - 1];
      this.depositFees.controls.aboveAmount.setValue(lastEntry.startRange);
      this.depositFees.controls.abovePercentage.setValue(lastEntry.percentage);
    } else if (feeType === 'upiPayout') {
      const feeDetails = fee.details;

      const lastEntry = feeDetails[feeDetails.length - 1];
      feeDetails.pop();

      this.removeOldErrors();
      while (this.upiPayoutFeeEntries.length !== 0) {
        this.upiPayoutFeeEntries.removeAt(0);
      }
      this.cdr.detectChanges();

      feeDetails.forEach((entry: any) => {
        this.upiPayoutFeeEntries.push(
          this.formBuilder.group({
            startRange: entry.startRange,
            endRange: entry.endRange,
            amount: entry.amount
          })
        );
      });

      this.upiPayoutFees.controls.aboveAmount.setValue(lastEntry.startRange);
      this.upiPayoutFees.controls.aboveAmountFee.setValue(lastEntry.amount);
    } else {
      this.feeAmount = fee.amount;
    }

    this.cdr.detectChanges();
    this.openFeeModal(feeType);
  }

  /**
   * Opens a modal that shows details of deposit and escrow fee
   * @param fee
   * @returns
   */
  showFeeDetails(fee: any) {
    if (
      fee.feeType !== 'Deposit Fee' &&
      fee.feeType !== 'Escrow Page' &&
      fee.feeType !== 'UPI Payout'
    )
      return;

    this.feeDetails = fee.details;

    if (fee.feeType === 'Escrow Page') {
      this.modalRef = this.modalService.open(this.escrowPageFeeDetails);
    }

    if (fee.feeType === 'Deposit Fee') {
      this.modalRef = this.modalService.open(this.depositFeeDetails);
    }

    if (fee.feeType === 'UPI Payout') {
      this.modalRef = this.modalService.open(this.upiPayoutFeeDetails);
    }

    this.cdr.detectChanges();
  }

  getFeeTitle(feeType: string) {
    return (feeTypes as any)[feeType];
  }

  /**
   * toggle deletion of a fee
   * @param id
   */
  toggleDeletion(id: number) {
    this.fees.map((fees: any) => {
      if (fees.id === id) {
        fees.markedForDeletion = !fees.markedForDeletion;
      }
    }) as any;

    this.cdr.detectChanges();
  }

  /**
   * Returns an object that conatins all entries to be deleted
   * @returns object
   */
  prepareFeeDeletionObject() {
    let d = JSON.parse(JSON.stringify(this.fees))
      .filter((fee: any) => fee.markedForDeletion)
      .reduce((acc: any, elem: any) => {
        if (elem.feeType === 'Miscellaneous Fees') {
          const entry = {
            feeName: elem.details.feeName
          };

          if (acc.miscellaneousFee) acc.miscellaneousFee.push(entry);
          else acc.miscellaneousFee = [entry];
        } else {
          acc[(feeTypesNameAssociation as any)[elem.feeType]] =
            elem.feeAmount || elem.amount;
        }

        return acc;
      }, {});

    return d;
  }

  resetForm() {
    this.feeAmount = '';
    this.depositFees.reset();
    while (this.depositFeeEntries.length !== 1) {
      this.removeDepositFeeEntry(0);
    }

    this.escrowPageFeeForm.reset();
    this.escrowPageFeeForm.controls.perPage.setValue(false);
    this.escrowPageFeeForm.controls.perTransaction.setValue(false);
    this.escrowPageFeeForm.controls.upiFeeSetting.setValue('');
    this.escrowPageFeeForm.controls.nbFeeSetting.setValue('');
    this.escrowPageFeeForm.controls.dbFeeSetting.setValue('');

    this.miscellaneousFeeForm.reset();
    this.virtualOrTransactionFeeForm.reset();
  }

  /**
   * Makes api call to add new fee
   */
  async addNewFee() {
    // this._adding$.next(true);
    let fees = { feeDetails: {} };

    this.removeOldErrors();

    //Miscellaneous Fee
    if (this.feeType === 'miscellaneousFee') {
      this.findInvalidControls(this.miscellaneousFeeForm);

      const amount = Number.parseFloat(this.miscellaneousFeeForm.value.amount);

      if (Number.isNaN(amount) || amount === 0) {
        this.errors.push('Please enter a valid amount');
        this.cdr.detectChanges();
        return;
      }

      if (this.errors.length) return;

      fees.feeDetails = {
        miscellaneousFee: [
          {
            feeName: this.miscellaneousFeeForm.controls.feeName.value,
            frequency: this.miscellaneousFeeForm.controls.frequency.value,
            amount: this.miscellaneousFeeForm.controls.amount.value,
            effectiveDate: this.miscellaneousFeeForm.controls.effectiveDate
              .value
          }
        ] as any
      };
    }
    //Escrow Page
    else if (this.feeType === 'escrowPage') {
      const escrowPageControls = this.escrowPageFeeForm.controls;

      const values = Object.keys(escrowPageControls).reduce(
        (acc: any, key: any) => ({
          ...acc,
          [key]: escrowPageControls[key].value
        }),
        {}
      );

      if (!values.perPage && !values.perTransaction) {
        this.errors.push('Please select atleast one option');
        this.cdr.detectChanges();
        return;
      }

      if (
        escrowPageControls.perPage.value &&
        !escrowPageControls.perPageAmount.value
      ) {
        this.errors.push('Please enter a valid Per page amount');
        this.cdr.detectChanges();
        return;
      }

      if (values.perTransaction) {
        if (
          !values.upiFeeSetting &&
          !values.nbFeeSetting &&
          !values.dbFeeSetting
        ) {
          this.errors.push(
            'Please select atleast one of UPI, Net Banking or Debit Card options'
          );
          this.cdr.detectChanges();
          return;
        }

        if (
          values.upiFeeSetting &&
          (!values.upiFeeAmount || Number.parseFloat(values.upiFeeAmount) === 0)
        ) {
          this.errors.push('Please enter UPI fee amount');
          this.cdr.detectChanges();
          return;
        }

        if (
          values.nbFeeSetting &&
          (!values.nbFeeAmount || Number.parseFloat(values.nbFeeAmount) === 0)
        ) {
          this.errors.push('Please enter Net Banking fee amount');
          this.cdr.detectChanges();
          return;
        }

        if (
          values.dbFeeSetting &&
          (!values.dbFeeAmount || Number.parseFloat(values.dbFeeAmount) === 0)
        ) {
          this.errors.push('Please enter Debit Card fee amount');
          this.cdr.detectChanges();
          return;
        }

        if (
          (values.upiFeeAmount && !values.upiFeeSetting) ||
          (values.nbFeeAmount && !values.nbFeeSetting) ||
          (values.dbFeeAmount && !values.dbFeeSetting)
        ) {
          this.errors.push('Please select fee setting for corresponding fee');
          this.cdr.detectChanges();
          return;
        }
      } else {
        this.escrowPageFeeForm.controls.upiFeeSetting.setValue('');
        this.escrowPageFeeForm.controls.nbFeeSetting.setValue('');
        this.escrowPageFeeForm.controls.dbFeeSetting.setValue('');

        this.escrowPageFeeForm.controls.upiFeeAmount.setValue('');
        this.escrowPageFeeForm.controls.nbFeeAmount.setValue('');
        this.escrowPageFeeForm.controls.dbFeeAmount.setValue('');
        this.cdr.detectChanges();
      }

      fees.feeDetails = {
        escrowPage: {
          perPage: escrowPageControls.perPage.value,
          perPageAmount: escrowPageControls.perPage.value
            ? escrowPageControls.perPageAmount.value
            : null,
          perTransaction: escrowPageControls.perTransaction.value,
          perTransactionFeeDetails: {
            upi: {
              feeAmount: escrowPageControls.upiFeeAmount.value,
              feeSetting: escrowPageControls.upiFeeSetting.value
            },
            netBanking: {
              feeAmount: escrowPageControls.nbFeeAmount.value,
              feeSetting: escrowPageControls.nbFeeSetting.value
            },
            debitCard: {
              feeAmount: escrowPageControls.dbFeeAmount.value,
              feeSetting: escrowPageControls.dbFeeSetting.value
            }
          }
        } as any
      };
    }
    // Transaction fee and virtual Account Fee
    else if (
      this.feeType === 'transaction' ||
      this.feeType === 'virtualAccount'
    ) {
      this.findInvalidControls(this.virtualOrTransactionFeeForm);

      if (
        this.virtualOrTransactionFeeForm.value.feeAmount === '' ||
        Number.parseFloat(this.virtualOrTransactionFeeForm.value.feeAmount) ===
          0
      ) {
        this.errors.push('Please enter a valid fee amount');
        this.cdr.detectChanges();
      }

      if (this.errors.length) return;

      fees.feeDetails = {
        [this.feeType]: {
          feeAmount: Number.parseFloat(
            this.virtualOrTransactionFeeForm.controls.feeAmount.value
          ),
          feeSetting: this.virtualOrTransactionFeeForm.controls.feeSetting.value
        }
      } as any;
    }
    // Deposit Fee
    else if (this.feeType === 'depositFee') {
      this.checkDepositFeeOverlap();

      if (this.errors.length) return;

      const { aboveAmount, abovePercentage } = this.depositFees.value;

      // this.depositFeeEntries.push(
      //   this.newDepositFeeEntry(aboveAmount, -1, abovePercentage)
      // );

      const depositFee = this.depositFees.value.depositFeeEntries;
      if (depositFee[depositFee.length - 1].endRange !== -1) {
        depositFee.push({
          startRange: aboveAmount,
          endRange: -1,
          percentage: abovePercentage
        });
      }

      fees.feeDetails = {
        depositFee
      };
    } else if (this.feeType === 'upiPayout') {
      // TODO: check for empty values and throw errors

      const { aboveAmount, aboveAmountFee } = this.upiPayoutFees.value;

      const upiPayoutFee = this.upiPayoutFees.value.upiPayoutFeeEntries;
      upiPayoutFee.push({
        startRange: aboveAmount,
        endRange: -1,
        amount: aboveAmountFee
      });

      fees.feeDetails = {
        upiPayoutFee
      };
    }
    // All the other fees are handled by this
    else {
      fees = {
        feeDetails: { [this.feeType]: Number.parseFloat(this.feeAmount) }
      };
      if (this.feeAmount === '' || Number.parseFloat(this.feeAmount) === 0) {
        this.errors.push('Please enter the fee amount');
        this.cdr.detectChanges();
        return;
      }
    }

    this.cdr.detectChanges();

    this.feeService.addFee(this.merchantId, fees).subscribe(
      (resp: any) => {
        if (resp.success) {
          (this.modalRef as NgbModalRef).close();
          this.utilityService.showToast(
            'Success',
            `${this.getFeeTitle(this.feeType)} updated successfully`,
            { headerClasses: 'bg-success text-white' }
          );
          this.loadFees();
          this.resetForm();
        }
      },
      err => {
        console.log(err);
        this.utilityService.showToast('Error', err.error.errors[0], {
          headerClasses: 'bg-danger text-white'
        });
      }
    );
  }

  updateFeeDetails() {
    const feeDeleteObj = this.prepareFeeDeletionObject();
    console.log(feeDeleteObj);
    if (Object.keys(feeDeleteObj).length === 0) return;

    this.feeService
      .deleteFee(this.merchantId, { feeDetails: feeDeleteObj })
      .subscribe(
        (resp: any) => {
          if (resp.success) {
            this.utilityService.showToast(
              'Success',
              'Selected fees deleted successfully',
              {
                headerClasses: 'bg-success text-white'
              }
            );
            this.loadFees();
            // (this.modalRef as NgbModalRef).close();
          }
        },
        err => {
          this.utilityService.showToast('Error', err.error.errors[0], {
            headerClasses: 'bg-danger text-white'
          });
        }
      );
  }

  hasChange() {
    this.hasChanged = true;
    console.log(this.hasChanged);
    this.cdr.detectChanges();
  }

  mapFees(resp: any) {
    console.log(resp.result);
    if (resp.result) {
      this.feeDetailForm.controls.setUpFee.setValue(
        resp.result.feeDetails?.setUpFee || null
      );
      this.feeDetailForm.controls.virtualAccountFeeSetting.setValue(
        resp.result.feeDetails?.virtualAccount?.feeSetting || null
      );
      this.feeDetailForm.controls.virtualAccountFee.setValue(
        resp.result.feeDetails?.virtualAccount?.feeAmount || null
      );
      this.feeDetailForm.controls.transactionFeeSetting.setValue(
        resp.result.feeDetails?.transaction?.feeSetting || null
      );
      this.feeDetailForm.controls.transactionFee.setValue(
        resp.result.feeDetails?.transaction?.feeAmount || null
      );
      if (resp.result.yesBanks?.length > 0) {
        for (let yesBank of resp.result.yesBanks) {
          if (yesBank.isIMPS) {
            this.feeDetailForm.controls.impsFee.setValue(
              resp.result.feeDetails?.imps || null
            );
            this.showIMPS = true;
          }
        }
      }
      this.feeDetailForm.controls.monthlyFee.setValue(
        resp.result.feeDetails?.monthly || null
      );
      if (resp.result.enableKYC) {
        this.feeDetailForm.controls.kycIndividualFee.setValue(
          resp.result.feeDetails?.kycIndividual || null
        );
        this.feeDetailForm.controls.kycBusinessFee.setValue(
          resp.result.feeDetails?.kycBusiness || null
        );
        this.showKYC = true;
      }

      if (resp.result.bankVerification) {
        this.feeDetailForm.controls.pennyTestFee.setValue(
          resp.result.feeDetails?.pennyTestFee || null
        );
        this.showPennyTest = true;
      }

      this.feeDetailForm.controls.isPaymentGateway.setValue(
        resp.result.feeDetails?.isPaymentGateway || null
      );

      if (resp.result.feeDetails.miscellaneousFee) {
        this.miscellanousFeeList.clear();
        for (let fee of resp.result.feeDetails.miscellaneousFee) {
          console.log(fee.active);
          this.miscellanousFeeList.push(
            this.formBuilder.group({
              feeName: fee.feeName,
              frequency: fee.frequency,
              amount: fee.amount,
              effectiveDate: fee.effectiveDate,
              active: fee.active
            })
          );
        }
      }

      // if (resp.result.feeDetails.depositFee) {
      //   this.depositFeeList.clear();
      //   for (let fee of resp.result.feeDetails.depositFee) {
      //     this.depositFeeList.push(
      //       this.formBuilder.group({
      //         startRange: fee.startRange,
      //         endRange: fee.endRange,
      //         percentage: fee.percentage
      //       })
      //     );
      //   }
      // }

      if (resp.result.escrowPagePG) {
        this.escrowPagePG = true;
      }
      this.feeDetailForm.controls.escrowFeePerPage.setValue(
        resp.result.feeDetails.escrowPage.perPage || null
      );
      if (resp.result.feeDetails.escrowPage.perPage) {
        this.escrowFeePerPage = true;
      }
      this.feeDetailForm.controls.escrowFeePerPageFee.setValue(
        resp.result.feeDetails.escrowPage.perPageAmount || null
      );
      this.feeDetailForm.controls.escrowFeePerTransaction.setValue(
        resp.result.feeDetails.escrowPage.perTransaction || null
      );
      if (resp.result.feeDetails.escrowPage.perTransaction) {
        this.escrowFeePertransaction = true;
      }
      this.feeDetailForm.controls.upiFeeSetting.setValue(
        resp.result.feeDetails.escrowPage.perTransactionFeeDetails.upi
          .feeSetting || null
      );
      this.upiFeeSettingFixedAmount =
        this.feeDetailForm.controls.upiFeeSetting.value === 'fixed-amount'
          ? true
          : false;
      this.feeDetailForm.controls.upiFeeAmount.setValue(
        resp.result.feeDetails.escrowPage.perTransactionFeeDetails.upi
          .feeAmount || null
      );
      this.feeDetailForm.controls.netBankingFeeSetting.setValue(
        resp.result.feeDetails.escrowPage.perTransactionFeeDetails.netBanking
          .feeSetting || null
      );
      this.feeDetailForm.controls.netBankingFeeAmount.setValue(
        resp.result.feeDetails.escrowPage.perTransactionFeeDetails.netBanking
          .feeAmount || null
      );
      this.nbFeeSettingFixedAmount =
        this.feeDetailForm.controls.netBankingFeeSetting.value ===
        'fixed-amount'
          ? true
          : false;
      this.feeDetailForm.controls.debitCardFeeSetting.setValue(
        resp.result.feeDetails.escrowPage.perTransactionFeeDetails.debitCard
          .feeSetting || null
      );
      this.feeDetailForm.controls.debitCardFeeAmount.setValue(
        resp.result.feeDetails.escrowPage.perTransactionFeeDetails.debitCard
          .feeAmount || null
      );
      this.dbFeeSettingFixedAmount =
        this.feeDetailForm.controls.debitCardFeeSetting.value === 'fixed-amount'
          ? true
          : false;
    }

    this.cdr.detectChanges();
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.errors.push('Please enter a valid ' + name);
      }
    }

    this.cdr.detectChanges();
  }

  removeOldErrors() {
    this.errors = [];
    this.miscellanousFeeError = false;
    this.depositFeeError = false;
    this.misAmountError = false;
    this.depositFeeOverlapError = false;
    this.depositFeeRangeError = false;
    this.cdr.detectChanges();
  }

  escrowFeePerPageCheck() {
    this.escrowFeePerPage = this.feeDetailForm.controls.escrowFeePerPage.value
      ? true
      : false;
    this.hasChanged = true;
    this.cdr.detectChanges();
  }

  escrowFeePerTransactionCheck() {
    this.escrowFeePertransaction = this.feeDetailForm.controls
      .escrowFeePerTransaction.value
      ? true
      : false;
    this.hasChanged = true;
    this.cdr.detectChanges();
  }

  onUPIFeeSettingChange() {
    this.upiFeeSettingFixedAmount =
      this.feeDetailForm.controls.upiFeeSetting.value === 'fixed-amount'
        ? true
        : false;
    this.hasChanged = true;
    this.cdr.detectChanges();
  }

  onNBFeeSettingChange() {
    this.nbFeeSettingFixedAmount =
      this.feeDetailForm.controls.netBankingFeeSetting.value === 'fixed-amount'
        ? true
        : false;
    this.hasChanged = true;
    this.cdr.detectChanges();
  }

  onDBFeeSettingChange() {
    this.dbFeeSettingFixedAmount =
      this.feeDetailForm.controls.debitCardFeeSetting.value === 'fixed-amount'
        ? true
        : false;
    this.hasChanged = true;
    this.cdr.detectChanges();
  }

  onFeeChange($event: any) {
    if ($event.target.value === '' || $event.target.value === null) {
      this.depositPercentError = true;
    } else {
      this.depositPercentError = false;
    }

    this.hasChanged = true;
    this.cdr.detectChanges();
  }

  onSubmit() {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */

    if (
      this.depositFeeOverlapError ||
      this.depositFeeError ||
      this.misAmountError ||
      this.depositPercentError
    ) {
      return;
    }

    this.removeOldErrors();

    for (let feeDetail of this.feeDetailForm.value.miscellanousFees) {
      if (feeDetail.frequency === 'one-time') {
        if (
          feeDetail.feeName === '' ||
          feeDetail.feeName === null ||
          feeDetail.amount === '' ||
          feeDetail.amount === null
        ) {
          this.miscellanousFeeError = true;
          this.spinner.hide();
          this.cdr.detectChanges();
          return;
        }
      } else if (
        Object.values(feeDetail).includes(null) ||
        Object.values(feeDetail).includes('')
      ) {
        this.miscellanousFeeError = true;
        this.spinner.hide();
        this.cdr.detectChanges();
        return;
      }
      delete feeDetail.minDate;
      delete feeDetail.maxDate;
      // delete feeDetail.active;
      feeDetail.amount = Number.parseFloat(feeDetail.amount);
      if (feeDetail.amount < 1) {
        this.misAmountError = true;
        this.spinner.hide();
        this.cdr.detectChanges();
        return;
      }
    }

    for (let feeDetail of this.feeDetailForm.value.depositFees) {
      if (
        Object.values(feeDetail).includes(null) ||
        Object.values(feeDetail).includes('')
      ) {
        this.depositFeeError = true;
        this.spinner.hide();
        this.cdr.detectChanges();
        return;
      }

      feeDetail.startRange = Number.parseFloat(feeDetail.startRange);
      feeDetail.endRange = Number.parseFloat(feeDetail.endRange);
      feeDetail.percentage = Number.parseFloat(feeDetail.percentage);
    }

    this.spinner.show();

    const formData = {
      feeDetails: {
        setUpFee: this.feeDetailForm.controls.setUpFee.value,
        virtualAccount: {
          feeSetting: this.feeDetailForm.controls.virtualAccountFeeSetting
            .value,
          feeAmount: this.feeDetailForm.controls.virtualAccountFee.value
        },
        transaction: {
          feeSetting: this.feeDetailForm.controls.transactionFeeSetting.value,
          feeAmount: this.feeDetailForm.controls.transactionFee.value
        },
        monthly: this.feeDetailForm.controls.monthlyFee.value,
        kycIndividual: this.feeDetailForm.controls.kycIndividualFee.value,
        kycBusiness: this.feeDetailForm.controls.kycBusinessFee.value,
        imps: this.feeDetailForm.controls.impsFee.value,
        isPaymentGateway: this.feeDetailForm.controls.isPaymentGateway.value
          ? true
          : false,
        pennyTestFee: this.feeDetailForm.controls.pennyTestFee.value,
        miscellaneousFee: this.feeDetailForm.value.miscellanousFees,
        depositFee: this.feeDetailForm.value.depositFees,
        escrowPage: {
          perPage: this.feeDetailForm.controls.escrowFeePerPage.value
            ? true
            : false,
          perPageAmount: this.feeDetailForm.controls.escrowFeePerPageFee.value,
          perTransaction: this.feeDetailForm.controls.escrowFeePerTransaction
            .value
            ? true
            : false,
          perTransactionAmount: this.feeDetailForm.controls
            .escrowFeePerTransactionFee.value,
          perTransactionFeeDetails: {
            upi: {
              feeSetting: this.feeDetailForm.controls.upiFeeSetting.value,
              feeAmount: this.feeDetailForm.controls.upiFeeAmount.value
            },
            netBanking: {
              feeSetting: this.feeDetailForm.controls.netBankingFeeSetting
                .value,
              feeAmount: this.feeDetailForm.controls.netBankingFeeAmount.value
            },
            debitCard: {
              feeSetting: this.feeDetailForm.controls.debitCardFeeSetting.value,
              feeAmount: this.feeDetailForm.controls.debitCardFeeAmount.value
            }
          }
        }
      }
    };

    this.merchantService
      .updateProfileDetails(this.merchantId, '', formData)
      .subscribe(
        resp => {
          console.log(resp);
          if (resp.success) {
            this._loading$.next(true);
            this.removeOldErrors();
            // this.mapFees(resp);
            this.hasChanged = false;
            this.toastBody = 'Merchant fees updated successfully.';
            this.toastHead = 'Success';
            this.utilityService.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-success text-white'
            });
            this.spinner.hide();
            this.cdr.detectChanges();
          }
        },
        (err: any) => {
          this._loading$.next(false);
          this.errors = err.error.errors;
          this.toastBody = this.errors[0];
          this.toastHead = 'Failed';
          this.utilityService.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          this.spinner.hide();
          this.cdr.detectChanges();
        }
      );
    this.cdr.detectChanges();
  }

  get miscellanousFeeFormGroup() {
    return this.feeDetailForm.get('miscellanousFees') as FormArray;
  }

  removeMiscellanousFee(index: number) {
    this.removeOldErrors();
    this.miscellanousFeeList.removeAt(index);
    // this.emitAccountAuthorizers.emit(
    //   this.settingsForm.value.authorizers as AccountInputAuthorizerInterface[]
    // );
    this.hasChanged = true;

    this.cdr.detectChanges();
  }

  createMiscellanousFee() {
    return this.formBuilder.group({
      feeName: [null, Validators.required],
      frequency: [null, Validators.required],
      amount: [null, Validators.required],
      effectiveDate: [null, Validators.required],
      minDate: [null],
      maxDate: [null]
    });
  }

  addMiscellanousFee() {
    this.removeOldErrors();
    for (let feeDetail of this.feeDetailForm.value.miscellanousFees) {
      if (
        feeDetail.feeName === null ||
        feeDetail.feeName === '' ||
        feeDetail.amount === null ||
        feeDetail.amount === '' ||
        feeDetail.frequency === null ||
        feeDetail.frequency === '' ||
        feeDetail.effectiveDate === null ||
        feeDetail.effectiveDate === ''
      ) {
        this.miscellanousFeeError = true;
        this.cdr.detectChanges();
        return;
      }
    }
    if (this.miscellanousFeeList.length >= 100) {
      this.errors.push('Reached Max Limit.');
      return;
    }
    this.miscellanousFeeList.insert(0, this.createMiscellanousFee());
    console.log(this.miscellanousFeeList.length);
    this.cdr.detectChanges();
  }

  dropMiscellanousFee(event: CdkDragDrop<string[]>) {
    //moveItemInArray(this.authorizerFormGroup, event.previousIndex, event.currentIndex);
    const miscellanousFeeToMove = this.miscellanousFeeList.at(
      event.previousIndex
    );
    this.miscellanousFeeList.removeAt(event.previousIndex);
    this.miscellanousFeeList.insert(event.currentIndex, miscellanousFeeToMove);
    // this.emitAccountAuthorizers.emit(this.settingsForm.value.authorizers);
    this.cdr.detectChanges();
  }

  get depositFeeFormGroup() {
    return this.feeDetailForm.get('depositFees') as FormArray;
  }

  dropDepositFee(event: CdkDragDrop<string[]>) {
    //moveItemInArray(this.authorizerFormGroup, event.previousIndex, event.currentIndex);
    const depositFeeToMove = this.depositFeeList.at(event.previousIndex);
    this.depositFeeList.removeAt(event.previousIndex);
    this.depositFeeList.insert(event.currentIndex, depositFeeToMove);
    // this.emitAccountAuthorizers.emit(this.settingsForm.value.authorizers);
    this.cdr.detectChanges();
  }

  onFromChange($event: any, index: number) {
    this.removeOldErrors();

    this.depositFeeList.controls[this.depositFeeList.length - 1].setValue({
      startRange: this.depositFeeList.controls[this.depositFeeList.length - 2]
        .value.endRange,
      endRange: depositFeeConstant.DEPOSIT_UPPER_LIMIT,
      percentage: null
    });

    for (let i in this.depositFeeList.value) {
      // if (parseInt(i) === this.depositFeeList.length - 1) continue;
      for (let j in this.depositFeeList.value) {
        if (parseInt(i) === parseInt(j)) continue;
        if (
          parseInt(i) === this.depositFeeList.length - 2 &&
          parseInt(j) === this.depositFeeList.length - 1
        )
          continue;
        if (
          Number.parseFloat(this.depositFeeList.value[i].startRange) >=
            Number.parseFloat(this.depositFeeList.value[j].startRange) &&
          Number.parseFloat(this.depositFeeList.value[i].startRange) <=
            Number.parseFloat(this.depositFeeList.value[j].endRange)
        ) {
          this.depositFeeOverlapError = true;
          this.cdr.detectChanges();
          return;
        }
      }
    }

    this.depositFeeOverlapError = false;
    this.cdr.detectChanges();
    return;
  }

  onChange($event: any, index: number) {
    // this.removeOldErrors();
    this.depositFeeList.controls[this.depositFeeList.length - 1].setValue({
      startRange: this.depositFeeList.controls[this.depositFeeList.length - 2]
        .value.endRange,
      endRange: depositFeeConstant.DEPOSIT_UPPER_LIMIT,
      percentage: null
    });

    for (let i in this.depositFeeList.value) {
      // if (parseInt(i) === this.depositFeeList.length - 1) continue;
      for (let j in this.depositFeeList.value) {
        if (parseInt(j) === parseInt(i)) continue;
        if (
          parseInt(i) === this.depositFeeList.length - 2 &&
          parseInt(j) === this.depositFeeList.length - 1
        )
          continue;
        if (
          Number.parseFloat(this.depositFeeList.value[i].endRange) <=
            Number.parseFloat(this.depositFeeList.value[j].endRange) &&
          Number.parseFloat(this.depositFeeList.value[i].endRange) >=
            Number.parseFloat(this.depositFeeList.value[j].startRange)
        ) {
          this.depositFeeOverlapError = true;
          this.cdr.detectChanges();
          return;
        }
      }
      this.depositFeeOverlapError = false;
    }

    if (
      Number.parseFloat(this.depositFeeList.value[index].endRange) <
      Number.parseFloat(this.depositFeeList.value[index].startRange)
    ) {
      this.depositFeeRangeError = true;
      this.cdr.detectChanges();
      return;
    } else {
      this.depositFeeRangeError = false;
      this.cdr.detectChanges();
    }

    this.cdr.detectChanges();
  }

  onFrequencyChange($event: any, i: number) {
    this.removeOldErrors();

    let date = new Date();
    if ($event.target.value === 'one-time') {
      this.miscellanousFeeList.controls[i].setValue({
        feeName: this.miscellanousFeeList.controls[i].value.feeName,
        frequency: this.miscellanousFeeList.controls[i].value.frequency,
        amount: this.miscellanousFeeList.controls[i].value.amount,
        effectiveDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        },
        minDate: null,
        maxDate: null
      });
      this.hasChanged = true;
      this.cdr.detectChanges();

      return;
    }

    if ($event.target.value !== 'yearly') {
      this.miscellanousFeeList.controls[i].setValue({
        feeName: this.miscellanousFeeList.controls[i].value.feeName,
        frequency: this.miscellanousFeeList.controls[i].value.frequency,
        amount: this.miscellanousFeeList.controls[i].value.amount,
        effectiveDate: this.miscellanousFeeList.controls[i].value.effectiveDate,
        minDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        },
        maxDate: {
          year: date.getFullYear() + 1,
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      });
    } else {
      this.miscellanousFeeList.controls[i].setValue({
        feeName: this.miscellanousFeeList.controls[i].value.feeName,
        frequency: this.miscellanousFeeList.controls[i].value.frequency,
        amount: this.miscellanousFeeList.controls[i].value.amount,
        effectiveDate: this.miscellanousFeeList.controls[i].value.effectiveDate,
        minDate: {
          year: date.getFullYear() - 1,
          month: date.getMonth() + 1,
          day: date.getDate() + 1
        },
        maxDate: {
          year: date.getFullYear() + 1,
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      });
    }
    this.cdr.detectChanges();
  }

  onAmountChange($event: any, i: number) {
    this.removeOldErrors();

    let vals = this.miscellanousFeeList.controls[i].value;
    if (vals.amount < 1) this.misAmountError = true;
    this.hasChanged = true;
    this.cdr.detectChanges();
    return;
  }

  onKeyPress(event: any) {
    if (event.key === 'Tab') {
      return;
    }
    event.preventDefault();
  }
}

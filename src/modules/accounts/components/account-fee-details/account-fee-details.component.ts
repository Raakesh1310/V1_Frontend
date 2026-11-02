import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from '@common/services';
import { AccountDescriptionInput } from '@modules/accounts/models';
import { AccountsAdminService } from '@modules/accounts/services';
import { MerchantService } from '@modules/merchant/services';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'sbpro-account-fee-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-fee-details.component.pug',
  styleUrls: ['account-fee-details.component.scss']
})
export class AccountFeeDetailsComponent implements OnInit {
  feeDetailForm!: FormGroup;
  errors: string[] = [];
  @Input() accountId = '';
  toastHead = '';
  toastBody = '';
  merchantId = '';

  private _loading$ = new BehaviorSubject(false);
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountsAdminService,
    private utilityService: UtilityService,
    private cdr: ChangeDetectorRef
  ) {
    this.feeDetailForm = this.formBuilder.group({
      transactionFeeSetting: [null, Validators.required],
      transactionFee: [null, Validators.required],
      monthlyFee: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.accountService.getAccount(this.accountId).subscribe((resp: any) => {
      if (resp.result) {
        console.log(resp.result.merchantId)
        this.merchantId = resp.result.merchantId || '';
        this.feeDetailForm.controls.transactionFeeSetting.setValue(
          resp.result.feeDetails?.transaction?.feeSetting || null
        );
        this.feeDetailForm.controls.transactionFee.setValue(
          resp.result.feeDetails?.transaction?.feeAmount || null
        );
        this.feeDetailForm.controls.monthlyFee.setValue(
          resp.result.feeDetails?.monthly || null
        );
      }
      this.cdr.detectChanges();
    });
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.errors.push('Please enter a valid ' + name);
      }
    }
  }

  removeOldErrors() {
    this.errors = [];
    this.cdr.detectChanges();
  }

  onSubmit() {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.removeOldErrors();

    const values = this.feeDetailForm.value;
    const isTxnFeeValid = !isNaN(parseFloat(values.transactionFee));

    const isTransactionFeeSettingEmpty =
      !values.transactionFeeSetting || values.transactionFeeSetting === '';

    if (
      isTransactionFeeSettingEmpty &&
      (!values.monthlyFee || values.monthlyFee === '')
    ) {
      this.errors.push('Please enter either transaction or monthly fee');
    }

    if (isTxnFeeValid && isTransactionFeeSettingEmpty) {
      this.errors.push('Please select a transaction fee setting');
    }

    if (!isTransactionFeeSettingEmpty && !isTxnFeeValid) {
      this.errors.push('Please enter a valid transaction fee');
    }

    this.cdr.detectChanges();
    if (this.errors.length) return;

    const formData = {
      feeDetails: {
        transaction: {
          feeSetting: this.feeDetailForm.controls.transactionFeeSetting.value,
          feeAmount: this.feeDetailForm.controls.transactionFee.value
        },
        monthly: this.feeDetailForm.controls.monthlyFee.value
      }
    };

    console.log(this.merchantId);
    this.accountService
      .update(
        this.accountId,
        formData as AccountDescriptionInput,
        this.merchantId
      )
      .subscribe(
        resp => {
          console.log(resp);
          if (resp.success) {
            this._loading$.next(true);
            this.toastBody = 'Merchant fees updated successfully.';
            this.toastHead = 'Success';
            this.utilityService.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-success text-white'
            });
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
          this.cdr.detectChanges();
        }
      );
    this.cdr.detectChanges();
  }
}

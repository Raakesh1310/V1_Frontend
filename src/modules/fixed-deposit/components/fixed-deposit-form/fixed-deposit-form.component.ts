import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import {
  FixedDepositDetail,
  FixedDepositInput,
  FixedDepositResp
} from '@modules/fixed-deposit/models';
import { FixedDepositService } from '@modules/fixed-deposit/services';
import { NgbCalendar, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-fixed-deposit-form',
  templateUrl: './fixed-deposit-form.component.pug',
  styleUrls: ['./fixed-deposit-form.component.scss']
})
export class FixedDepositFormComponent implements OnInit {
  fdForm: FormGroup;
  errors: string[] = [];
  @Input() accountId = '';
  @Input() fd?: FixedDepositDetail;
  @Input() doClose?: NgbModalRef;
  submitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private fdService: FixedDepositService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private calendar: NgbCalendar,
    private dateParser: NgbDateParserService
  ) {
    this.fdForm = this.formBuilder.group({
      amount: [this.fd?.amount || null, [Validators.required]],
      fdAccountNo: [this.fd?.fdAccountNo || null, [Validators.required]],
      tenure: [this.fd?.tenure || null, [Validators.required]],
      valueDate: [this.fd?.valueDate || null, [Validators.required]],
      maturityDate: [this.fd?.maturityDate || null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.fdForm.controls.amount.setValue(this.fd?.amount || null);
    this.fdForm.controls.fdAccountNo.setValue(this.fd?.fdAccountNo || null);
    this.fdForm.controls.tenure.setValue(this.fd?.tenure || null);
    this.fdForm.controls.valueDate.setValue(this.fd?.valueDate || null);
    this.fdForm.controls.maturityDate.setValue(this.fd?.maturityDate || null);
    if (this.fd) {
      this.fdForm.controls.amount.disable();
      this.fdForm.controls.fdAccountNo.disable();
    }
  }

  findInvalidControls(form: any) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.errors.push('Please enter a valid ' + name);
      }
    }
  }

  onSubmit() {
    this.errors = [];
    if (!this.fd && !this.fdForm.valid) {
      this.findInvalidControls(this.fdForm);
      return;
    }

    this.submitting = true;

    let data: FixedDepositInput = {
      ...this.fdForm.value,
      valueDate:
        typeof this.fdForm.controls.valueDate.value !== 'string'
          ? new Date(
              this.dateParser.format(this.fdForm.controls.valueDate.value)
            ).toISOString()
          : this.fdForm.controls.valueDate.value,
      maturityDate:
        typeof this.fdForm.controls.maturityDate.value !== 'string'
          ? new Date(
              this.dateParser.format(this.fdForm.controls.maturityDate.value)
            ).toISOString()
          : this.fdForm.controls.maturityDate.value
    };

    if (!this.fd) {
      data.accountId = this.accountId;
    }

    console.log(data);

    this.fdService.createFD(data, this.fd?.fixedDepositId).subscribe(
      (resp: FixedDepositResp) => {
        console.log(resp);
        this.submitting = false;
        if (resp.success) {
          this.showToast(
            'Success',
            this.fd ? 'FD updated successfull.' : 'FD created successfull.',
            {
              headerClasses: 'bg-success text-white'
            }
          );
          this.closeModal();
        } else {
          this.errors = resp.errors;
        }
      },
      err => {
        this.submitting = false;
        this.showToast(
          'Failed',
          this.fd ? 'Failed to update FD.' : 'Failed to create FD.',
          {
            headerClasses: 'bg-danger text-white'
          }
        );
        this.closeModal();
      }
    );
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
  closeModal() {
    this.doClose?.close(true);
  }
}

import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@modules/auth/services';
import { BankAccountService } from '@modules/bank-account/services';
import { Location } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'sbpro-bank-account-basic-details',
  templateUrl: './bank-account-basic-details.component.pug',
  styleUrls: ['./bank-account-basic-details.component.scss']
})
export class BankAccountBasicDetailsComponent implements OnInit {
  detailForm!: FormGroup;
  errors: string[] = [];
  isAdmin = false;
  private bankAccountNo: string | null;
  readOnly = true;
  updating = false;
  editMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private bankAccountService: BankAccountService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private _location: Location,
    private spinner: NgxSpinnerService
  ) {
    this.bankAccountNo = activatedRoute.snapshot.paramMap.get('accountId');
    this.isAdmin = this.authService.isSuperAdmin();
    this.detailForm = this.formBuilder.group({
      accountName: [null, Validators.required],
      bankAccountNumber: [null, Validators.required],
      bankName: [null, Validators.required],
      accountType: [null, Validators.required],
      accountBalance: [null, Validators.required],
      effectiveAccountBalance: [null]
    });
    this.isAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit() {
    if (!this.isAdmin) {
      this.detailForm.disable();
    }
    this.spinner.show();
    this.bankAccountService
      .fetchAccount(this.isAdmin, { bankAccountNo: this.bankAccountNo })
      .subscribe((resp: any) => {
        this.spinner.hide();
        console.log(resp);
        if (resp) {
          this.detailForm.controls.accountName.setValue(
            resp[0].accountName || null
          );
          this.detailForm.controls.bankAccountNumber.setValue(
            resp[0].bankAccountNo || null
          );
          this.detailForm.controls.bankName.setValue(resp[0].bankName || null);
          this.detailForm.controls.accountType.setValue(
            resp[0].accountType || null
          );
          this.detailForm.controls.accountBalance.setValue(
            resp[0]?.balance || null
          );
          this.detailForm.controls.effectiveAccountBalance.setValue(
            resp[0]?.effectiveBalance || null
          );
        }
        this.cdr.detectChanges();
      });
  }

  toggleEditMode() {
    this.editMode = true;
    this.detailForm.enable();
    this.readOnly = false;
  }

  goBack() {
    this._location.back();
  }

  update() {
    this.updating = true;
    const formData: any = {};
    if (this.detailForm.controls.accountName.dirty) {
      formData.accountName = this.detailForm.controls.businessName.value;
    }
    if (this.detailForm.controls.bankName.dirty) {
      formData.bankName = this.detailForm.controls.bankName.value;
    }
    if (this.detailForm.controls.accountType.dirty) {
      formData.accountName = this.detailForm.controls.accountType.value;
    }
    if (this.detailForm.controls.accountBalance.dirty) {
      formData.accountName = this.detailForm.controls.accountBalance.value;
    }
    // set the updated data and make api call
    this.updating = false;
  }
}

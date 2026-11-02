import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { relationshipManager } from '@modules/merchant/constants/relationshipManager.constant';
import { useCase } from '@modules/merchant/constants/useCase.constant';
import {
  CreateMerchantRequestInterface,
  UpdateMerchantBasicDetailsInterface
} from '@modules/merchant/models/merchant-create.model';
import { MerchantService } from '@modules/merchant/services';
import { timeStamp } from 'console';
import { format } from 'path';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'sbpro-merchant-basic-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './merchant-basic-detail.component.pug',
  styleUrls: ['merchant-basic-detail.component.scss']
})
export class MerchantBasicDetailComponent implements OnInit {
  detailForm!: FormGroup;
  success = '';
  errors: string[] = [];
  updateValues: UpdateMerchantBasicDetailsInterface;
  updating = false;
  submitted = false;
  @Input() readOnly = false;
  @Input() merchantId = '';
  @Input() merchantEmail = '';
  @Input() editMode = true;
  @Input() new = false;
  @Output() public emitMerchantIdAndEmail: EventEmitter<{
    merchantId: string;
    merchantEmail: string;
  }> = new EventEmitter();
  @Output() public emitMerchantName: EventEmitter<string> = new EventEmitter();
  @Output() public emitMerchantId: EventEmitter<string> = new EventEmitter();
  private _loading$ = new BehaviorSubject(false);
  rm: string[] = relationshipManager;
  uc: string[] = useCase;
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }
  constructor(
    private formBuilder: FormBuilder,
    private merchantService: MerchantService,
    private cdr: ChangeDetectorRef,
    private _location: Location
  ) {
    this.detailForm = this.formBuilder.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      businessName: [null, Validators.required],
      email: [null, Validators.required],
      mobile: [null, Validators.required],
      emailVerified: [false],
      status: ['InActive'],
      createdAt: [new Date().toDateString()],
      useCase: [null],
      relationshipManager: [
        null,
        [
          (val: FormControl) => {
            if (!RegExp('^[A-Za-z0-9-& ]*$').test(val.value)) {
              return {
                Error: `RM should not contain any special Characters.`
              };
            }
          }
        ]
      ]
    });
    this.updateValues = {};
  }
  ngOnInit() {
    const projection = [
      'firstName',
      'lastName',
      'businessName',
      'email',
      'mobile',
      'verificationVerified',
      'profileVerified',
      'createdAt',
      '__update_firstName',
      '__update_lastName',
      '__update_businessName',
      '__update_email',
      '__update_mobile',
      'relationshipManager',
      'useCase'
    ];

    if (!this.editMode) {
      this.detailForm.disable();
    }

    this.new = this.merchantId ? false : true;
    this.merchantService
      .fetchBasicDetails(this.merchantId, projection)
      .subscribe((resp: any) => {
        console.log(resp);
        if (resp.result) {
          this.detailForm.controls.firstName.setValue(
            resp.result.firstName || null
          );
          this.detailForm.controls.lastName.setValue(
            resp.result.lastName || null
          );
          this.detailForm.controls.businessName.setValue(
            resp.result.businessName || null
          );
          this.emitMerchantName.emit(resp.result.businessName);
          this.detailForm.controls.email.setValue(resp.result.email || null);
          this.detailForm.controls.mobile.setValue(resp.result.mobile || null);
          this.detailForm.controls.emailVerified.setValue(
            resp.result.verificationVerified || false
          );
          if (resp.result.profileVerified) {
            this.detailForm.controls.status.setValue('Active');
          }
          this.detailForm.controls.createdAt.setValue(
            new Date(resp.result.createdAt).toDateString()
          );
          this.detailForm.controls.relationshipManager.setValue(
            resp.result.relationshipManager || null
          );
          this.detailForm.controls.useCase.setValue(
            resp.result.useCase || null
          );
          // Add Updated Values
          this.updateValues.updatedBusinessName =
            resp.result.__update_businessName || null;
          this.updateValues.updatedEmail = resp.result.__update_email || null;
          this.updateValues.updatedFirstName =
            resp.result.__update_firstName || null;
          this.updateValues.updatedLastName =
            resp.result.__update_lastName || null;
          this.updateValues.updatedMobile = resp.result.__update_mobile || null;
          console.log(this.updateValues);
          this.cdr.detectChanges();
        }
      });
  }

  toggleEditMode() {
    if (this.editMode) {
      this.editMode = false;
      this.detailForm.disable();
      return;
    }
    this.editMode = true;
    this.detailForm.enable();
  }

  update() {
    this.removeOldErrors();

    if (!this.detailForm.valid) {
      console.log('Invalid form values found');
      this.findInvalidControls(this.detailForm);
      this.cdr.detectChanges();
      return;
    }
    this.updating = true;
    const formData: any = {};
    if (this.detailForm.controls.businessName.dirty) {
      formData.businessName = this.detailForm.controls.businessName.value;
    }

    if (this.detailForm.controls.mobile.dirty) {
      formData.mobile = this.detailForm.controls.mobile.value;
    }

    if (this.detailForm.controls.email.dirty) {
      formData.email = this.detailForm.controls.email.value;
      formData.emailVerification = true;
    }
    if (this.detailForm.controls.emailVerified.dirty) {
      formData.emailVerification = this.detailForm.controls.emailVerified.value;
    }

    if (this.detailForm.controls?.firstName?.dirty) {
      formData.firstName = this.detailForm.controls.firstName.value;
    }
    if (this.detailForm.controls?.lastName?.dirty) {
      formData.lastName = this.detailForm.controls.lastName.value;
    }

    if (this.detailForm.controls?.relationshipManager?.dirty) {
      formData.relationshipManager = this.detailForm.controls.relationshipManager.value;
    }

    if (this.detailForm.controls?.useCase?.dirty) {
      formData.useCase = this.detailForm.controls.useCase.value;
    }

    this.merchantService.updateBasicDetail(this.merchantId, formData).subscribe(
      (resp: any) => {
        this.toggleEditMode();
        this.updating = false;
        if (resp.success) {
          this.emitMerchantName.emit(
            this.detailForm.controls.businessName.value
          );
          this.success = 'Updated Successfully.';
          this.ngOnInit();
        }
      },
      (err: any) => {
        this.updating = false;
        this.errors = err.error.errors;
        this.cdr.detectChanges();
      }
    );
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    for (const name in controls) {
      const control = controls[name];
      if (control.invalid) {
        if (control.hasError('required')) {
          this.errors.push('Please enter a valid ' + name);
        } else if (control.hasError('Error')) {
          this.errors.push(control.getError('Error'));
        }
      }
    }
    this.cdr.detectChanges();
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

    // console.log('called onSubmit');

    if (!this.detailForm.valid) {
      console.log('Invalid form values found');
      this.findInvalidControls(this.detailForm);
      this.cdr.detectChanges();
      return;
    }
    this._loading$.next(true);
    console.log(this.detailForm.value);
    const formData: CreateMerchantRequestInterface = {
      firstName: this.detailForm.controls.firstName.value,
      lastName: this.detailForm.controls.lastName.value,
      businessName: this.detailForm.controls.businessName.value,
      mobile: this.detailForm.controls.mobile.value,
      email: this.detailForm.controls.email.value,
      emailVerified: this.detailForm.controls.emailVerified.value,
      relationshipManager: this.detailForm.controls.relationshipManager.value,
      useCase: this.detailForm.controls.useCase.value
    };
    console.log(formData);
    this.merchantService.createMerchant(formData).subscribe(
      resp => {
        if (resp.success) {
          console.log(resp);
          this._loading$.next(false);
          this.merchantId = resp.result.merchant.merchantId;
          this.emitMerchantName.emit(resp.result.merchant.title);
          this.emitMerchantId.emit(resp.result.merchant.merchantId);
          this.merchantEmail = resp.result.userEntry.email;
          this.submitted = true;
          this.editMode = true;
          this.new = false;
          this.emitMerchantIdAndEmail.emit({
            merchantId: this.merchantId,
            merchantEmail: this.merchantEmail
          });
          this.ngOnInit();
        }
      },
      (err: any) => {
        this._loading$.next(false);
        this.errors = err.error.errors;
        this.cdr.detectChanges();
      }
    );
  }

  goBack() {
    this._location.back();
  }
}

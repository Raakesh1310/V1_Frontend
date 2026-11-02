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
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services/toast.service';
import {
  MerchantProfile,
  UpdateParty,
  merchantPromoterInterface
} from '@modules/auth/models/merchantProfile.model';
import { AuthService } from '@modules/auth/services';
import { ProfileResponseModel } from '@modules/profile/models/profile-response.model';
import { ProfileService } from '@modules/profile/services';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { PartiesService } from '@modules/parties/services';

@Component({
  selector: 'sbpro-add-parties',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-parties.component.pug',
  styleUrls: ['add-parties.component.scss']
})
export class AddPartiesComponent implements OnInit {
  @Input() public profileVerified = false;
  @Input() public businessType = '';
  @Input() public readOnly = false;
  @Input() public editMode = true;
  @Input() public merchantId: string | null = null;
  @Input() public isMerchantAuthorizer: boolean = false;
  @Input() public partyId: string = '';
  @Output() public setProfileVerified: EventEmitter<
    boolean
  > = new EventEmitter();
  @Output() public emitBusinessType: EventEmitter<string> = new EventEmitter();
  @Output() public emitCntrCloseModal: EventEmitter<
    boolean
  > = new EventEmitter();
  businessVerifiedTime = '';
  bankAccountVerified = false;
  addressError: string[] = [];
  profileErrors: string[] = [];
  panErrors: string[] = [];
  success: string[] = [];
  dropdown = [
    'Private Limited',
    'Public Limited',
    'Proprietorship',
    'Partnership Firm',
    'LLP',
    'TRUST',
    'Society',
    'NGO'
  ];
  isReadonly: boolean;
  profile!: MerchantProfile;
  toastHead = '';
  toastBody = '';
  isDisabled = false;
  businessVerified = false;
  bankForm!: FormGroup;
  bankFormErrors: Array<string> = [];
  promoterFormErrors: Array<string> = [];
  promoterForm!: FormArray;
  authorizedPersonPanVerified = false;
  partyForm!: FormGroup;
  profileForm!: FormGroup;
  addressForm!: FormGroup;
  authorizedPersonForm!: FormGroup;
  updateValues: UpdateParty;
  validIFSC = /[A-Z|a-z]{4}[0][a-zA-Z0-9]{6}$/;
  numbersCheck = /^[0-9]*$/;

  constructor(
    private partyService: PartiesService,
    private profileService: ProfileService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private _location: Location
  ) {
    if (!this.partyId) {
      this.isReadonly = false;
      this.editMode = true;
    } else {
      this.isReadonly = true;
      this.editMode = false;
    }
    this.updateValues = {};
    this.partyForm = formBuilder.group({
      businessName: [
        null,
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `Bussiness Name is Empty` };
            }
          }
        ]
      ],
      businessType: [
        'Select Business Type',
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === 'Select Business Type' ||
              val.value === undefined
            ) {
              return { Error: `Please Select a Business Type` };
            }
          }
        ]
      ],
      businessGst: [
        null,
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `Bussiness GST is Empty` };
            }
          }
        ]
      ],
      businessPan: [
        null,
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `Bussiness GST is Empty` };
            }
          }
        ]
      ]
    });

    this.addressForm = formBuilder.group({
      addressLine: [
        null,
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `Address Line is Empty` };
            }
          }
        ]
      ],
      pinCode: [
        null,
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `Pin Code is Empty` };
            }
            if (!new RegExp(/^\d{6}$/).test(val.value)) {
              return { Error: `Invalid Pin Code` };
            }
          }
        ]
      ],
      city: [
        null,
        [
          Validators.required,
          (val: FormGroup) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `City is Empty` };
            }
          }
        ]
      ],
      state: [
        null,
        [
          Validators.required,
          (val: FormGroup) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `State is Empty` };
            }
          }
        ]
      ]
    });

    this.bankForm = this.formBuilder.group({
      accountNo: [
        '',
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `Account Number is Empty.` };
            }
            if (!RegExp('^[A-Za-z0-9- ]*$').test(val.value)) {
              return {
                Error: `Account Number should not contain special Characters.`
              };
            }
          }
        ]
      ],
      bankName: [
        '',
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `Bank Name is Empty.` };
            }
            if (!RegExp('^[A-Za-z ]*$').test(val.value)) {
              return {
                Error: `Bank Name should not contain Numbers or special Characters.`
              };
            }
          }
        ]
      ],
      ifsc: [
        '',
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `Ifsc is Empty.` };
            }
            if (!RegExp('[A-Z|a-z]{4}[0][a-zA-Z0-9]{6}$').test(val.value)) {
              return { Error: `Ifsc is invalid.` };
            }
          }
        ]
      ],
      bankBranch: [
        '',
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `Bank Branch is Empty.` };
            }
            if (!RegExp('^[A-Za-z0-9- ]*$').test(val.value)) {
              return {
                Error: `Bank Branch should not contain special Characters.`
              };
            }
          }
        ]
      ]
    });

    this.promoterForm = this.formBuilder.array([this.createPromoter()]);
  }

  private _setAddressDetails$ = new BehaviorSubject(false);

  get setAddressDetails$(): Observable<boolean> {
    return this._setAddressDetails$.asObservable();
  }

  private _verifyingBusinessDetails$ = new BehaviorSubject(false);

  get verifyingBusinessDetails$(): Observable<boolean> {
    return this._verifyingBusinessDetails$.asObservable();
  }

  private _verifyingPersonDetails$ = new BehaviorSubject(false);

  get verifyingPersonDetails$(): Observable<boolean> {
    return this._verifyingPersonDetails$.asObservable();
  }

  private _loadingData$ = new BehaviorSubject(false);

  get loadingData$(): Observable<boolean> {
    return this._loadingData$.asObservable();
  }

  private _dataLoaded = false;

  get dataLoaded(): boolean {
    return this._dataLoaded;
  }

  get isIndividual() {
    return this.authService.isIndividual();
  }

  createPromoter(
    promoter: merchantPromoterInterface = {
      aadhar: '',
      authorizedPersonPan: '',
      lastName: '',
      firstName: '',
      email: '',
      mobile: ''
    }
  ) {
    return this.formBuilder.group({
      firstName: [
        promoter.firstName,
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `First Name is Empty.` };
            }
            if (!RegExp('^[A-Za-z ]*$').test(val.value)) {
              return {
                Error: `First Name should not contain special Characters or Numbers.`
              };
            }
          }
        ]
      ],
      lastName: [
        promoter.lastName,
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `Last Name is Empty.` };
            }
            if (!RegExp('^[A-Za-z ]*$').test(val.value)) {
              return {
                Error: `Last Name should not contain special Characters or Number.`
              };
            }
          }
        ]
      ],
      email: [promoter.email, [Validators.required]],
      mobile: [promoter.mobile, [Validators.required]],
      authorizedPersonPan: [
        promoter.authorizedPersonPan,
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `Pan is Empty.` };
            }
          }
        ]
      ],
      aadhar: [
        promoter.aadhar,
        [
          Validators.required,
          (val: FormControl) => {
            if (
              val.value === undefined ||
              (typeof val.value === 'string' && val.value.trim() === '')
            ) {
              return { Error: `Aadhaar is Empty.` };
            }
            if (!RegExp('^[0-9]{12}$').test(val.value)) {
              return { Error: `Aadhaar Number is not valid.` };
            }
          }
        ]
      ],
      updateFirstName: [promoter.__update_firstName] || null,
      updateLastName: [promoter.__update_lastName] || null,
      updateMobile: [promoter.__update_mobile] || null,
      updateEmail: [promoter.__update_email] || null,
      updateAuthorizedPersonPan: [promoter.__update_authorizedPersonPan] || null,
      updateAadhar: [promoter.__update_aadhar] || null
    });
  }

  addPromoter() {
    this.promoterForm.push(this.createPromoter());
    console.log(this.promoterForm);
    this.cdr.detectChanges();
  }

  removePromoter(index: number) {
    console.log(index);
    this.promoterForm.removeAt(index);
    this.cdr.detectChanges();
  }

  toggleEditMode() {
    if (this.editMode) {
      this.editMode = false;
      this.readOnly = true;
      this.isReadonly = true;
      this.partyForm.disable();
      this.addressForm.disable();
      this.promoterForm.disable();
      this.bankForm.disable();
      return;
    }
    this.editMode = true;
    this.readOnly = false;
    this.isReadonly = false;
    this.partyForm.enable();
    this.addressForm.enable();
    this.promoterForm.enable();
    this.bankForm.enable();
  }

  ngOnInit() {
    if (!this.partyId) {
      this.isReadonly = false;
      this.editMode = true;
    } else {
      this.isReadonly = true;
      this.editMode = false;
    }

    if (this.partyId) {
      this.partyService
        .getParty(this.merchantId as string, this.partyId as string)
        .subscribe(
          (resp: any) => {
            console.log('RESPONSE ', resp);
            this._loadingData$.next(false);
            this._dataLoaded = true;

            this.partyForm
              .get('businessName')
              ?.setValue(resp.result.businessName);
            this.partyForm
              .get('businessType')
              ?.setValue(resp.result.businessType || '');
            this.emitBusinessType.emit(resp.result.businessType);
            this.partyForm
              .get('businessGst')
              ?.setValue(resp.result.businessGst);
            this.partyForm
              .get('businessPan')
              ?.setValue(resp.result.businessPan);
            this.partyForm
              .get('businessVerified')
              ?.setValue(resp.result.businessVerified);
            this.businessVerifiedTime = resp.result.businessVerifiedAt;
            console.log('BUSINESS ', this.businessVerifiedTime);
            this.addressForm
              .get('addressLine')
              ?.setValue(resp.result.addressLine);
            this.addressForm.get('pinCode')?.setValue(resp.result.pinCode);
            this.addressForm.get('city')?.setValue(resp.result.city);
            this.addressForm.get('state')?.setValue(resp.result.state);
            this.bankForm.get('accountNo')?.setValue(resp.result.accountNo);
            this.bankForm.get('bankName')?.setValue(resp.result.bankName);
            this.bankForm.controls['ifsc'].setValue(resp.result.ifsc);
            this.bankForm.controls['bankBranch'].setValue(
              resp.result.bankBranch
            );
            if (resp.result.promoters && resp.result.promoters.length > 0) {
              this.promoterForm.controls = [];
              resp.result.promoters.forEach((it: any) => {
                this.promoterForm.push(this.createPromoter(it));
              });
              console.log(this.promoterForm.at(0).value.firstName);
              this.promoterForm.disable();
            }
            this.authorizedPersonForm
              .get('authorizedPersonPan')
              ?.setValue(resp.result.authorizedPersonPan);
            this.authorizedPersonForm
              .get('firstName')
              ?.setValue(resp.result.firstName);
            this.authorizedPersonForm
              .get('lastName')
              ?.setValue(resp.result.lastName);
            this.authorizedPersonForm.get('email')?.setValue(resp.result.email);
            this.authorizedPersonForm
              .get('mobile')
              ?.setValue(resp.result.mobile);

            // Updated Values
            this.updateValues.updateBusinessName = resp.result.__update_businessName || null;
            this.updateValues.updateBusinessType = resp.result.__update_businessType || null;
            this.updateValues.updateBusinessGst = resp.result.__update_businessGst || null;
            this.updateValues.updateBusinessPan = resp.result.__update_businessPan || null;

            // Address Values
            this.updateValues.updateAddressLine = resp.result.__update_addressLine || null;
            this.updateValues.updatePinCode = resp.result.__update_pinCode || null;
            this.updateValues.updateCity = resp.result.__update_city || null;
            this.updateValues.updateState = resp.result.__update_state || null;
            this.updateValues.updateCountry = resp.result.__update_country || null;

            // Bank Values
            this.updateValues.updateAccountNo = resp.result.__update_accountNo || null;
            this.updateValues.updateBankName = resp.result.__update_bankName || null;
            this.updateValues.updateIfsc = resp.result.__update_ifsc || null;
            this.updateValues.updateBankBranch = resp.result.__update_bankBranch || null;
            this.cdr.detectChanges();
          },
          (error: any) => {
            console.log(error);
            this._loadingData$.next(false);
          }
        );
    }
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    console.log('CONTROLS ', controls);
    for (const name in controls) {
      const control = controls[name];

      if (control.invalid) {
        if (control.hasError('required')) {
          this.profileErrors.push(`Please enter a valid ${name}`);
        } else if (control.hasError('Error')) {
          this.profileErrors.push(control.getError('Error'));
        }
      }
    }
    this.toastBody = 'Please fill all the mandatory fields.';
    this.toastHead = 'Failed';
    this.showToast(this.toastHead, this.toastBody, {
      headerClasses: 'bg-danger text-white'
    });
    this.cdr.detectChanges();
  }

  addParty() {
    console.log('PARTY FORM ', this.partyForm);
    console.log('STATUS ', this.partyForm.valid);

    console.log('PARTY FORM ', this.addressForm);
    console.log('STATUS ', this.addressForm.valid);

    console.log('PARTY FORM ', this.bankForm);
    console.log('STATUS ', this.bankForm.valid);

    this.profileErrors = [];
    this.cdr.detectChanges();
    if (!this.merchantId) {
      this.partyForm.removeControl('businessVerified');
    }
    // If form is disabled, valid is false...
    if (!this.partyForm.valid) {
      console.log('VERIFYING....', this.partyForm);
      this.findInvalidControls(this.partyForm);
      return;
    }
    if (!this.addressForm.valid) {
      console.log('VERIFYING....', this.addressForm);
      this.findInvalidControls(this.addressForm);
      return;
    }
    if (!this.bankForm.valid) {
      console.log('VERIFYING....', this.bankForm);
      this.findInvalidControls(this.bankForm);
      return;
    }
    if (!this.partyForm.get('businessType')?.value) {
      this.profileErrors = ['Select Business type'];
      return;
    }
    this._verifyingBusinessDetails$.next(true);

    let data = {
      ...this.partyForm.value,
      ...this.addressForm.value,
      ...this.bankForm.value,
      promoters: this.promoterForm.value
    };

    console.log(data);

    this.partyService
      .createParty({
        merchantId: this.merchantId,
        ...this.partyForm.value,
        ...this.addressForm.value,
        ...this.bankForm.value,
        promoters: this.promoterForm.value
      })
      .subscribe(
        (resp: ProfileResponseModel) => {
          this._verifyingBusinessDetails$.next(false);
          if (resp.success) {
            this.emitCntrCloseModal.emit(true);
            this.toastBody = 'Business details updated successfully.';
            this.toastHead = 'Success';
            this.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-success text-white'
            });

            window.scrollTo(0, 0);
            this.emitCntrCloseModal.emit(true);
            this.cdr.detectChanges();
          } else {
            this.toastBody = resp.errors[0];
            this.toastHead = 'Failed';
            this.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-danger text-white'
            });
          }
        },
        (error: any) => {
          this._verifyingBusinessDetails$.next(false);
          this.toastBody = 'Server Error. Please try again later.';
          this.toastHead = 'Failed';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-danger text-white'
          });
        }
      );
  }

  updateParty() {
    console.log('FORM ', this.partyForm);
    console.log('STATUS ', this.partyForm.valid);
    this.profileErrors = [];
    this.cdr.detectChanges();
    if (!this.merchantId) {
      this.partyForm.removeControl('businessVerified');
    }
    // If form is disabled, valid is false...
    if (!this.partyForm.valid) {
      console.log('VERIFYING....', this.partyForm);
      this.findInvalidControls(this.partyForm);
      return;
    }

    if (!this.partyForm.get('businessType')?.value) {
      this.profileErrors = ['Select Business type'];
      return;
    }

    this.partyService
      .updateParty(this.partyId as string, {
        ...this.partyForm.value,
        ...this.addressForm.value,
        ...this.bankForm.value,
        promoters: this.promoterForm.value
      })
      .subscribe(
        (resp: ProfileResponseModel) => {
          if (resp.success) {
            this.emitCntrCloseModal.emit(true);
            this.toastBody = 'Business details updated successfully.';
            this.toastHead = 'Success';
            this.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-success text-white'
            });

            window.scrollTo(0, 0);
            this.emitCntrCloseModal.emit(true);
            this.cdr.detectChanges();
          } else {
            this.toastBody = resp.errors[0];
            this.toastHead = 'Failed';
            this.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-danger text-white'
            });
          }
        },
        (error: any) => {
          this._verifyingBusinessDetails$.next(false);
          this.toastBody = 'Server Error. Please try again later.';
          this.toastHead = 'Failed';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-danger text-white'
          });
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

  goBack() {
    this._location.back();
  }
}

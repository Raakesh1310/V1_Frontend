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
  UpdateMerchantBusinessProfile,
  merchantPromoterInterface
} from '@modules/auth/models/merchantProfile.model';
import { AuthService } from '@modules/auth/services';
import { ProfileResponseModel } from '@modules/profile/models/profile-response.model';
import { ProfileService } from '@modules/profile/services';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { promotersStruct, UserProfile } from '@modules/profile/models';

@Component({
  selector: 'sbpro-profile-basic-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-basic-details.component.pug',
  styleUrls: ['profile-basic-details.component.scss']
})
export class ProfileBasicDetailsComponent implements OnInit {
  @Input() public profileVerified = false;
  @Input() public businessType = '';
  @Input() public readOnly = false;
  @Input() public editMode = true;
  @Input() public merchantId: string | null = null;
  @Output() public setProfileVerified: EventEmitter<
    boolean
  > = new EventEmitter();
  @Output() public emitBusinessType: EventEmitter<string> = new EventEmitter();
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
  // promoterList!: FormArray;
  authorizedPersonPanVerified = false;
  profileForm!: FormGroup;
  addressForm!: FormGroup;
  authorizedPersonForm!: FormGroup;
  validIFSC = /[A-Z|a-z]{4}[0][a-zA-Z0-9]{6}$/;
  numbersCheck = /^[0-9]*$/;
  updateValues: UpdateMerchantBusinessProfile;
  private _tabsUpdated$ = new Subject();

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private _location: Location
  ) {
    this.isReadonly = true;
    this.profileForm = formBuilder.group({
      businessName: [null],
      businessType: [null],
      businessGst: [null],
      businessPan: [null],
      businessVerified: false
    });
    this.updateValues = {};

    this.addressForm = formBuilder.group({
      addressLine: [null, Validators.required],
      pinCode: [null, Validators.required],
      city: [null, Validators.required],
      state: [null, Validators.required]
    });

    this.bankForm = this.formBuilder.group({
      accountNo: [
        '',
        [
          Validators.required,
          (val: FormControl) => {
            if (val.value === '' || val.value === undefined) {
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
            if (val.value === '' || val.value === undefined) {
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
            if (val.value === '' || val.value === undefined) {
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
            if (val.value === '' || val.value === undefined) {
              return { Error: `Bank Branch is Empty.` };
            }
            if (!RegExp('^[A-Za-z0-9- ]*$').test(val.value)) {
              return {
                Error: `Bank Branch should not contain special Characters.`
              };
            }
          }
        ]
      ],
      bankAccountVerified: false,
      bankVerifiedAt: [null]
    });

    this.promoterForm = this.formBuilder.array([this.createPromoter()]);

    // this.promoterForm = this.formBuilder.group({
    //   promoter: this.formBuilder.array([this.createPromoter()]),
    // });

    this.authorizedPersonForm = formBuilder.group({
      authorizedPersonPan: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      authorizedPersonPanVerified: false
    });
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

  get panRequired() {
    if (this.profileForm.get('businessType')?.value !== 'Proprietorship') {
      this.profileForm.addControl(
        'businessPan',
        new FormControl(null, {
          validators: [Validators.required]
        })
      );
      return true;
    } else {
      this.profileForm.removeControl('businessPan');
      return false;
    }
  }

  createPromoter(
    promoter: merchantPromoterInterface = {
      promoterDetailsVerifiedAt: '',
      aadhar: '',
      authorizedPersonPan: '',
      lastName: '',
      firstName: ''
    }
  ) {
    return this.formBuilder.group({
      firstName: [
        promoter.firstName,
        [
          Validators.required,
          (val: FormControl) => {
            if (val.value === '' || val.value === undefined) {
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
            if (val.value === '' || val.value === undefined) {
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
      authorizedPersonPan: [
        promoter.authorizedPersonPan,
        [
          Validators.required,
          (val: FormControl) => {
            if (val.value === '' || val.value === undefined) {
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
            if (val.value === '' || val.value === undefined) {
              return { Error: `Aadhaar is Empty.` };
            }
            if (!RegExp('^[0-9]{12}$').test(val.value)) {
              return { Error: `Aadhaar Number is not valid.` };
            }
          }
        ]
      ],
      promoterDetailsVerifiedAt: [promoter.promoterDetailsVerifiedAt] || null,
      updateFirstName: [promoter.__update_firstName] || null,
      updateLastName: [promoter.__update_lastName] || null,
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
      this.profileForm.disable();
      this.addressForm.disable();
      this.authorizedPersonForm.disable();
      this.promoterForm.disable();
      this.bankForm.disable();
      return;
    }
    this.editMode = true;
    this.profileForm.enable();
    this.addressForm.enable();
    this.authorizedPersonForm.enable();
    this.promoterForm.enable();
    this.bankForm.enable();
  }

  ngOnInit() {
    if (!this.editMode) {
      this.profileForm.disable();
      this.addressForm.disable();
      this.authorizedPersonForm.disable();
      this.promoterForm.disable();
      this.bankForm.disable();
    }
    this.isReadonly = this.merchantId
      ? false
      : this.authService.isMerchantVerified();
    this._loadingData$.next(true);

    this.profileService.getProfile(this.merchantId, false).subscribe(
      resp => {
        console.log('RESPONSE ', resp);
        this._loadingData$.next(false);
        this._dataLoaded = true;
        /**
         * Update the values
         */
        this.businessVerified = resp.result.businessVerified;
        this.authorizedPersonPanVerified =
          resp.result.authorizedPersonPanVerified;
        //this.bankAccountVerified = resp.result.bankAccountVerified;

        if (!this.merchantId) {
          if (this.isIndividual) {
            if (this.businessVerified) {
              this.addressForm.disable();
            }

            if (this.authorizedPersonPanVerified) {
              this.authorizedPersonForm.disable();
            }

            if (this.businessVerified && this.authorizedPersonPanVerified) {
              this.setProfileVerified.emit(true);
            }
          } else {
            if (this.businessVerified && this.authorizedPersonPanVerified) {
              this.setProfileVerified.emit(true);
              this.addressForm.disable();
              this.profileForm.disable();
              this.authorizedPersonForm.disable();
            }

            if (this.businessVerified) {
              this.addressForm.disable();
              this.profileForm.disable();
            }

            if (this.authorizedPersonPanVerified) {
              this.authorizedPersonForm.disable();
            }
          }
        }
        if (!this.isIndividual) {
          this.profileForm
            .get('businessName')
            ?.setValue(resp.result.businessName);
          this.profileForm
            .get('businessType')
            ?.setValue(resp.result.businessType || '');
          this.emitBusinessType.emit(resp.result.businessType);
          this.profileForm
            .get('businessGst')
            ?.setValue(resp.result.businessGst);

          this.profileForm
            .get('businessPan')
            ?.setValue(resp.result.businessPan);
          this.profileForm
            .get('businessVerified')
            ?.setValue(resp.result.businessVerified);
          this.businessVerifiedTime = resp.result.businessVerifiedAt;
        }
        console.log('BUSINESS ', this.businessVerifiedTime);
        this.addressForm.get('addressLine')?.setValue(resp.result.addressLine);
        this.addressForm.get('pinCode')?.setValue(resp.result.pinCode);
        this.addressForm.get('city')?.setValue(resp.result.city);
        this.addressForm.get('state')?.setValue(resp.result.state);

        if (resp.result.promoters && resp.result.promoters.length > 0) {
          this.promoterForm.controls = [];
          //this.promoterForm.controls.length = resp.result.promoters.length;
          resp.result.promoters.forEach(it => {
            // this.promoterForm.setValue([it]);
            this.promoterForm.push(this.createPromoter(it));
          });
          console.log(this.promoterForm.at(0).value);
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
        this.authorizedPersonForm
          .get('authorizedPersonPanVerified')
          ?.setValue(resp.result.authorizedPersonPanVerified);

        this.bankForm.controls['accountNo'].setValue(resp.result.accountNo);
        this.bankForm.controls['bankName'].setValue(resp.result.bankName);
        this.bankForm.controls['ifsc'].setValue(resp.result.ifsc);
        this.bankForm.controls['bankBranch'].setValue(resp.result.bankBranch);
        this.bankForm.controls['bankAccountVerified'].setValue(
          resp.result.bankAccountVerified
        );
        this.bankForm.controls['bankVerifiedAt'].setValue(
          resp.result.bankVerifiedAt
        );

        this.bankAccountVerified = resp.result.bankAccountVerified;

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
      err => {
        console.log(err);
        this._loadingData$.next(false);
      }
    );
  }

  updateBusinessType() {
    this.emitBusinessType.emit(this.profileForm.get('businessType')?.value);
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    console.log('CONTROLS ', controls);
    for (const name in controls) {
      if (controls[name].invalid) {
        this.profileErrors.push('Please enter a valid ' + name);
      }
    }
    this.cdr.detectChanges();
  }

  verifyBusinessDetail() {
    console.log('FORM ', this.profileForm);
    console.log('STATUS ', this.profileForm.valid);
    this.profileErrors = [];
    this.cdr.detectChanges();
    if (!this.merchantId) {
      this.profileForm.removeControl('businessVerified');
    }
    // If form is disabled, valid is false...
    if (!this.profileForm.valid) {
      console.log('VERIFYING....', this.profileForm);
      this.findInvalidControls(this.profileForm);
      return;
    }

    if (!this.profileForm.get('businessType')?.value) {
      this.profileErrors = ['Select Business type'];
      return;
    }
    this._verifyingBusinessDetails$.next(true);

    this.profileService
      .verifyBusiness(this.merchantId, {
        ...this.profileForm.value,
        ...this.addressForm.value
      })
      .subscribe(
        (resp: ProfileResponseModel) => {
          this._verifyingBusinessDetails$.next(false);
          if (resp.success) {
            if (this.authorizedPersonPanVerified) {
              this.setProfileVerified.emit(true);
            }
            this.addressForm.controls.addressLine.setValue(
              resp.result.addressLine
            );
            this.addressForm.controls.state.setValue(resp.result.state);
            this.addressForm.controls.city.setValue(resp.result.city);
            this.addressForm.controls.pinCode.setValue(resp.result.pinCode);
            if (this.merchantId) {
              this.profileForm.controls.businessVerified.setValue(true);
            }
            if (!this.merchantId) {
              this.profileForm.disable();
              this.addressForm.disable();
            }

            // If pan verified disable profile and address form...
            // Will prevent Api call after one time update....
            if (this.authorizedPersonPanVerified) {
              //this.toggleEditMode();
              this.profileForm.disable();
              this.addressForm.disable();
            }
            // /**
            //  * Update the user firstName and lastName
            //  */
            // this.authService.setFirstName(
            //   this.profileForm.get('firstName')?.value
            // );
            // this.authService.setLastName(this.profileForm.get('lastName')?.value);

            this.businessVerified = true;

            this.toastBody = 'Business details updated successfully.';
            this.toastHead = 'Success';
            this.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-success text-white'
            });

            window.scrollTo(0, 0);
            this.ngOnInit();
          } else {
            this.toastBody = resp.errors[0];
            this.toastHead = 'Failed';
            this.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-danger text-white'
            });
          }
        },
        err => {
          this._verifyingBusinessDetails$.next(false);
          this.toastBody = 'Server Error. Please try again later.';
          this.toastHead = 'Failed';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-danger text-white'
          });
        }
      );
  }

  setAddressDetails() {
    this.addressError = [];

    if (!this.addressForm.valid) {
      this.findInvalidControls(this.addressForm);
      return;
    }
    this._setAddressDetails$.next(true);

    this.profileService
      .verifyBusiness(this.merchantId, {
        ...this.addressForm.value
      })
      .subscribe(
        (resp: ProfileResponseModel) => {
          this._setAddressDetails$.next(false);
          if (resp.success) {
            if (this.authorizedPersonPanVerified) {
              this.setProfileVerified.emit(true);
            }
            this.addressForm.controls.addressLine.setValue(
              resp.result.addressLine
            );
            this.addressForm.controls.state.setValue(resp.result.state);
            this.addressForm.controls.city.setValue(resp.result.city);
            this.addressForm.controls.pinCode.setValue(resp.result.pinCode);

            if (!this.merchantId) {
              this.profileForm.disable();
              this.addressForm.disable();
            }

            this.businessVerified = true;

            this.toastBody = 'Address updated successfully.';
            this.toastHead = 'Success';
            this.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-success text-white'
            });

            window.scrollTo(0, 0);
            this.ngOnInit();
          } else {
            this.toastBody = resp.errors[0];
            this.toastHead = 'Failed';
            this.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-danger text-white'
            });
          }
        },
        err => {
          this._verifyingBusinessDetails$.next(false);
          this.toastBody = 'Server Error. Please try again later.';
          this.toastHead = 'Failed';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-danger text-white'
          });
        }
      );
  }

  validateAllFormFields(formGroup: FormGroup) {
    // {1}
    Object.keys(this.authorizedPersonForm.controls).forEach(field => {
      // {2}
      const control = this.authorizedPersonForm.get(field); // {3}
      if (control instanceof FormControl) {
        // {4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        // {5}
        this.validateAllFormFields(control); // {6}
      }
    });
  }

  // verifyPersonDetails() {
  //   this.panErrors = [];
  //   this.cdr.detectChanges();
  //
  //   if (!this.merchantId) {
  //     this.authorizedPersonForm.removeControl('authorizedPersonPanVerified');
  //   }
  //
  //   if (!this.authorizedPersonForm.valid) {
  //     console.log('Invalid form values found');
  //     this.panErrors.push('Please fill all the required fields marked with *');
  //     this.validateAllFormFields(this.authorizedPersonForm);
  //     return;
  //   }
  //
  //   this._verifyingPersonDetails$.next(true);
  //
  //   this.profileService
  //     .verifyPan(this.merchantId, this.authorizedPersonForm.value)
  //     .subscribe(
  //       (resp: ProfileResponseModel) => {
  //         this._verifyingPersonDetails$.next(false);
  //         if (resp.success) {
  //           this.authorizedPersonPanVerified = true;
  //           if (this.merchantId) {
  //             this.authorizedPersonForm.controls.authorizedPersonPanVerified.setValue(
  //               true
  //             );
  //           }
  //           // If business verified disable form...
  //           // Will prevent Api call after one time update....
  //           if (this.businessVerified) {
  //             this.setProfileVerified.emit(true);
  //             this.authorizedPersonForm.disable();
  //             //this.toggleEditMode();
  //           }
  //           if (!this.merchantId) {
  //             this.authorizedPersonForm.disable();
  //           }
  //           this.toastBody = 'PAN details updated successfully.';
  //           this.toastHead = 'Success';
  //           this.showToast(this.toastHead, this.toastBody, {
  //             headerClasses: 'bg-success text-white'
  //           });
  //
  //           /**
  //            * Update the user firstName and lastName
  //            */
  //           this.authService.setFirstName(
  //             this.authorizedPersonForm.get('firstName')?.value
  //           );
  //           this.authService.setLastName(
  //             this.authorizedPersonForm.get('lastName')?.value
  //           );
  //
  //           window.scrollTo(0, 0);
  //           this.cdr.detectChanges();
  //         } else {
  //           this.toastBody = resp.errors[0];
  //           this.toastHead = 'Failed';
  //           this.showToast(this.toastHead, this.toastBody, {
  //             headerClasses: 'bg-danger text-white'
  //           });
  //         }
  //       },
  //       err => {
  //         this._verifyingPersonDetails$.next(false);
  //         this.toastBody = 'Server Error. Please try again later.';
  //         this.toastHead = 'Failed';
  //         this.showToast(this.toastHead, this.toastBody, {
  //           headerClasses: 'bg-danger text-white'
  //         });
  //       }
  //     );
  // }

  verifyBankDetails() {
    this.bankFormErrors = [];
    console.log('BANK FORM VALUES ', this.bankForm);
    if (!this.bankForm.valid) {
      const controls = this.bankForm.controls;
      for (const name in controls) {
        //console.log(name);
        if (controls[name].invalid) {
          // @ts-ignore
          this.bankFormErrors.push(controls[name].errors.Error);
        }
      }
      return;
    }
    delete this.bankForm.value.bankVerifiedAt;
    this.profileService
      .verifyAccount(this.merchantId, this.bankForm.value)
      .subscribe(
        resp => {
          //this._verifyingBankDetails$.next(false);
          console.log(resp);
          //this.toggleEditMode();
          if (resp.success) {
            // if (!this.merchantId) {
            this.bankAccountVerified = true;
            this.bankForm.controls.bankAccountVerified.setValue(true);
            this.bankForm.disable();
            // }
            this.toastBody = 'Bank details updated successfully.';
            this.toastHead = 'Success';
            this.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-success text-white'
            });
            this.bankForm.disable();
            //this.setBankAccountVerified.emit(resp.result.bankAccountVerified);
            this.ngOnInit();
          } else {
            this.toastBody = resp.errors[0];
            this.toastHead = 'Failed';
            this.showToast(this.toastHead, this.toastBody, {
              headerClasses: 'bg-danger text-white'
            });
          }
        },
        err => {
          // this._verifyingBankDetails$.next(false);
          this.toastBody = 'Server Error. Please try again later.';
          this.toastHead = 'Failed';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-danger text-white'
          });
        }
      );
  }

  verifyPromotersDetails() {
    this.promoterFormErrors = [];
    let promoters: promotersStruct[] = [];
    let flag = false; // to check form value and prevent from calling API...
    console.log('PROMOTERS FORM VALUES ', this.promoterForm.value);
    for (let i = 0; i < this.promoterForm.controls.length; i++) {
      console.log(this.promoterForm.controls[i]);
      // @ts-ignore
      let form = this.promoterForm.controls[i];
      // @ts-ignore
      let formValues = this.promoterForm.controls[i].controls;
      if (!form.valid) {
        flag = true;
        for (const name in formValues) {
          console.log(name);
          if (formValues[name].invalid) {
            // @ts-ignore
            this.promoterFormErrors.push(formValues[name].errors.Error);
          }
        }
        break;
      }
    }

    // to prevent API call...
    if (flag) {
      return;
    }

    this.promoterForm.value.forEach((it: merchantPromoterInterface) => {
      delete it?.promoterDetailsVerifiedAt;
      promoters.push({
        aadhar: it.aadhar,
        authorizedPersonPan: it.authorizedPersonPan,
        firstName: it.firstName,
        lastName: it.lastName
      });
    });

    // @ts-ignore
    let userModel: UserProfile = {
      promoters: promoters
    };
    //this.promoterForm.disable();
    this.editMode = false;
    //this.ngOnInit(); { promoters: this.promoterForm.value }
    this.profileService.verifyPan(this.merchantId, userModel).subscribe(
      (resp: ProfileResponseModel) => {
        this._verifyingPersonDetails$.next(false);
        if (resp.success) {
          this.authorizedPersonPanVerified = true;
          if (this.merchantId) {
            this.authorizedPersonForm.controls.authorizedPersonPanVerified.setValue(
              true
            );
          }
          // If business verified disable form...
          // Will prevent Api call after one time update....
          if (this.businessVerified) {
            this.setProfileVerified.emit(true);
            this.authorizedPersonForm.disable();
            //this.toggleEditMode();
          }
          if (!this.merchantId) {
            this.authorizedPersonForm.disable();
          }
          this.toastBody = 'PAN details updated successfully.';
          this.toastHead = 'Success';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-success text-white'
          });

          /**
           * Update the user firstName and lastName
           */
          this.authService.setFirstName(
            this.authorizedPersonForm.get('firstName')?.value
          );
          this.authService.setLastName(
            this.authorizedPersonForm.get('lastName')?.value
          );

          window.scrollTo(0, 0);
          this.ngOnInit();
          this.cdr.detectChanges();
        } else {
          this.toastBody = resp.errors[0];
          this.toastHead = 'Failed';
          this.showToast(this.toastHead, this.toastBody, {
            headerClasses: 'bg-danger text-white'
          });
        }
      },
      err => {
        this._verifyingPersonDetails$.next(false);
        this.toastBody = 'Server Error. Please try again later.';
        this.toastHead = 'Failed';
        this.showToast(this.toastHead, this.toastBody, {
          headerClasses: 'bg-danger text-white'
        });
      }
    );
  }

  // onUpdate() {
  //   console.log('On Update!!');
  //   this.businessVerified = false;
  //   this.authorizedPersonPanVerified = false;
  //   this.cdr.detectChanges();
  // }

  getDate(s: string): string {
    let date = new Date(s);
    return `${date.getDate()}/${date.getMonth() +
      1}/${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`;
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

  updateIfscDetails(event: any) {
    this.bankForm.controls.ifsc.setValue(
      event.target.value.toString().toUpperCase()
    );
    this.cdr.detectChanges();
  }

  goBack() {
    this._location.back();
  }
}

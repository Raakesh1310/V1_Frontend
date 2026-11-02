import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  ElementRef,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FileInputComponent, OtpModalComponent } from '@common/components';
import { UtilityService, toFormData } from '@common/services';
import { AuthService } from '@modules/auth/services';
import { Payee, PayeeDetail } from '@modules/payee/models';
import { PayeeService } from '@modules/payee/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';

import { Location } from '@angular/common';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services/toast.service';
import { ProfileService } from '@modules/profile/services';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import merchantUserRoles from 'config/merchantUserRoles';
import { NgxSpinnerService } from 'ngx-spinner';
import smsMsg91TemplateId from '../../../../config/smsMsg91TemplateId';
import { environment } from '../../../../environments/environment';
import _ from 'lodash';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { RoleAccessPoint } from '@modules/profile/models/roleAccess.model';

@Component({
  selector: 'sbpro-add-payee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-payee.component.pug',
  styleUrls: ['add-payee.component.scss']
})
export class AddPayeeComponent implements OnInit {
  MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  payeeForm!: FormGroup;
  bankBranch = 'Bank Branch';
  ifscError = '';
  submitted = false;
  payeeEntry!: Payee | null;
  payeeIdProvided = false;
  editMode = false;
  chequeFileName!: string;
  chequeFileTitle!: string;
  errors!: string[];
  gAuthEnabled = false;
  showFirstDiv = true;
  createdBy = '--';
  isAdmin = false;
  payeeId = '';
  additionDate = '';
  toastHead = '';
  toastBody = '';
  nameError = '';
  modalRef?: NgbModalRef;
  specialCharacterCheck = /^[A-Za-z0-9- ]*$/;
  readOnly = false;
  disabledBankNameAndBranch = false;
  upiFormatRegex = /^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$/;
  upiPayoutEnabled: boolean = false;
  vpaHolderName!: string;
  vpaHolderNameError!: string;
  downloadFolderName = S3FolderName.PAYEES;
  cancelledCheque: any;
  @Input() merchantId = '';
  @Output() public emitCloseModal: EventEmitter<boolean> = new EventEmitter();
  detailsModal?: NgbModalRef;
  @ViewChild('detailsTemplate') detailsTemplate!: TemplateRef<any>;
  @ViewChild('fileInput', {static: false}) fileInputRef!: ElementRef;
  // private detailsTemplate!: TemplateRef<any>;
  accountHolderName = '';
  bankVerification = false;
  addUpiId = false;
  merchantProfile!: MerchantProfile | null
  payeeInitialData: any;
  fileSizeValid = true;
  constructor(
    private formBuilder: FormBuilder,
    private payeeService: PayeeService,
    private router: Router,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private toastService: ToastService,
    private profileService: ProfileService,
    private spinner: NgxSpinnerService,
    private utilityService: UtilityService,
    private location: Location,
    private authServie: AuthService
  ) {
    localStorage.removeItem('payee_bool');
    this.errors = [];
    this.isAdmin = this.authService.isSuperAdmin();
    this.checkForReadOnly();
    this.merchantProfile = this.authService.getMerchantProfile();
  }

  checkForReadOnly() {
    let roles = this.authService.getRole();
    if (
      roles &&
      (roles?.indexOf(merchantUserRoles.TRUSTEE) > -1 ||
        roles?.indexOf(merchantUserRoles.SUPER_ADMIN_VIEWER) > -1 ||
        roles?.indexOf(merchantUserRoles.MERCHANT_AUTHORIZER) > -1)
    ) {
      this.readOnly = true;
    }

    const access = this.authService.getAccess() as RoleAccessPoint;
    if (access && Object.keys(access).length > 0 && !access['payee'].includes('Add Payee')) {
      this.readOnly = true;
    }
  }

  private _loading$ = new BehaviorSubject(false);
  private _verifyingVPA$ = new BehaviorSubject(false);

  // chequeFileSelected!: any;

  get verifyingVPA$(): Observable<boolean> {
    return this._verifyingVPA$.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  uploadFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
  
    if (file.size > this.MAX_FILE_SIZE) {
      this.fileSizeValid = false;
      this.errors = ['File size exceeds the maximum limit of 5MB'];
      this.cdr.detectChanges();
      return;
    }
    
    // Valid file case
    this.fileSizeValid = true;
    this.chequeFileName = file.name;
    this.chequeFileTitle = file.name;
    this.cancelledCheque = file;
    this.errors = this.errors.filter(err => !err.includes('File size exceeds'));
    this.cdr.detectChanges();
  }

  removeFile() {
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
    
    this.chequeFileName = '';
    this.chequeFileTitle = '';
    this.payeeForm.controls.docCancelledCheque.setValue('');
    this.fileSizeValid = true; // Reset the flag
    this.cdr.detectChanges();
    
    this.errors = this.errors.filter(err => !err.includes('File size exceeds'));
  }

  downloadCheque($event: Event) {
    $event.preventDefault();
    const blobFile = new Blob([_.first(this.docCancelledCheque?.value) as any]);
    this.utilityService.saveFile(blobFile, this.chequeFileName);
    this.cdr.detectChanges();
  }

  get accountHolder() {
    return this.payeeForm.get('accountHolder');
  }

  get accountNumber() {
    return this.payeeForm.get('accountNumber');
  }

  get ifsc() {
    return this.payeeForm.get('ifsc');
  }

  get mobile() {
    return this.payeeForm.get('mobile');
  }

  get email() {
    return this.payeeForm.get('email');
  }

  get bankName() {
    return this.payeeForm.get('bankName');
  }

  get bankAddress() {
    return this.payeeForm.get('bankAddress');
  }

  get docCancelledCheque() {
    console.log('Cancel cheque' + 'docCancelledCheque');
    return this.payeeForm.get('docCancelledCheque');
  }

  get vpa() {
    return this.payeeForm.get('vpa');
  }

  findInvalidControls(form: FormGroup) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        if (controls[name].hasError('Error')) {
          this.errors.push(controls[name].getError('Error'));
        } else if (controls[name].invalid) {
          this.errors.push('Please enter a valid ' + name);
        }
      }
    }
  }

  validateForm(formGroup: FormGroup) {
    // {1}
    Object.keys(this.payeeForm.controls).forEach(field => {
      // {2}
      const control = this.payeeForm.get(field); // {3}
      if (control instanceof FormControl) {
        // {4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        // {5}
        this.validateForm(control); // {6}
      }
    });
  }

  onlyTenNumbers(e: any) {
    try {
      let validation = e.key.toLowerCase().match(/^[0-9]+$/);

      let phoneNumber =
        this.payeeForm.controls['mobile'].value?.length + (validation ? 1 : 0);
      let val = phoneNumber > 10;
      if (
        (!val && validation) ||
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowLeft'
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  toggleEdit() {
    this.showFirstDiv = false;
    this.payeeIdProvided = false;
    this.editMode = true;
  }

  toggleAddUpi() {
    this.addUpiId = !this.addUpiId;
    console.log(this.addUpiId);
    this.vpa?.setValue('');
    this.cdr.detectChanges();
  }

  ngOnInit() {

    if (this.isAdmin && this.merchantId === '') {
      this.activatedRoute.queryParamMap.subscribe(resp => {
        console.log('RESPONSE FOR MERCHANT ID ', resp);
        this.merchantId = resp.get('merchantId') || '';
      });
    }

    this.profileService
      .getProfile(this.merchantId ? this.merchantId : null, false)
      .subscribe((resp: any) => {
        this.upiPayoutEnabled = resp.result.upiPayoutEnabled;
        if (resp.result.bankVerification) {
          this.bankVerification = true;
        }
        this.cdr.detectChanges();
      });

    this.payeeForm = this.formBuilder.group({
      accountHolder: ['', [Validators.required]],
      accountNumber: [
        '',
        [
          (val: FormControl) => {
            if (
              (!val.value || val.value === '' || val.value === undefined) &&
              !this.upiPayoutEnabled
            ) {
              return { Error: 'Account Number  is required' };
            }

            let data = val?.value?.replaceAll(/\s/g, '');
            console.log(val?.value?.replaceAll(/\s/g, ''));
            if (!data?.toString().match(this.specialCharacterCheck)) {
              return { Error: `Invalid Account Number` };
            }
          }
        ]
      ],
      ifsc: ['', [Validators.pattern('^[A-Za-z]{4}0[A-Za-z0-9]{6}$')]],
      bankName: [''],
      bankAddress: [''],
      mobile: ['', [Validators.required]],
      email: ['', [Validators.required, this.utilityService.emailValidator()]],
      otp: ['', null],
      docCancelledCheque: [null],
      vpa: ['', [Validators.pattern(this.upiFormatRegex)]]
    });

    this.payeeForm.valueChanges.subscribe(data => {
      this.checkFormValue(data)
        ? localStorage.setItem('payee_bool', 'false')
        : localStorage.setItem('payee_bool', 'true');
    });
    /**
     * Check for the data
     */


    this.activatedRoute.paramMap.subscribe(resp => {
      try {
        this.payeeService
          .findOne(resp.get('id') || '', this.merchantId)
          .subscribe((response: any) => {
            if (response.success) {
              this.payeeEntry = response.result;
              console.log(response.result);
              if (this.payeeEntry && this.payeeEntry.payeeId) {
                this.payeeIdProvided = true;
                // Apply the entry values to form
                this.accountHolder?.setValue(this.payeeEntry.accountHolder);
                this.accountNumber?.setValue(this.payeeEntry.accountNumber);
                this.ifsc?.setValue(this.payeeEntry.ifsc);
                this.bankName?.setValue(this.payeeEntry.bankName);
                this.bankAddress?.setValue(this.payeeEntry.bankAddress);
                this.mobile?.setValue(this.payeeEntry.mobile.toString());
                this.email?.setValue(this.payeeEntry.email);
                this.createdBy = this.payeeEntry.createdBy || '--';
                this.payeeId = this.payeeEntry.payeeId || '--';
                this.vpa?.setValue(this.payeeEntry.vpa);
                this.additionDate = moment(
                  new Date(this.payeeEntry.createdAt)
                ).format('DD MMM YYYY');
                if (this.payeeEntry.documents[0].file) {
                  this.chequeFileTitle = this.payeeEntry.documents[0].file;
                  // TODO: This has to be sorted in environment files
                  this.chequeFileName = this.payeeEntry.documents[0].serverFile;
                }

                /**
                 * Make all the fields disabled
                 */
                this.payeeForm.controls.docCancelledCheque?.disable();
                this.payeeInitialData = { ...this.payeeEntry };
                this.cdr.detectChanges();
              }
            }
          });
      } catch (e) {
        console.error(e);
      }
    });

    this.payeeForm.controls.vpa.valueChanges.subscribe(_ => {
      this.vpaHolderName = '';
      this.vpaHolderNameError = '';
      this.cdr.detectChanges();
    });
  }

  checkFormValue(data: any): boolean {
    for (let key in data) {
      if (data[key] !== null && data[key] !== '' && data[key] !== undefined) {
        return true;
      }
    }
    return false;
  }

  // tslint:disable-next-line:no-any
  async updateIfscDetails($event: any) {
    // First of all check if payeeId is there
    if (this.payeeIdProvided) {
      return;
    }
    this.payeeService
      .sendIfscRequest($event.target.value)
      // tslint:disable-next-line:no-any
      .subscribe((data: any) => {
        if (data.message) {
          this.ifscError = data.message;
          this.disabledBankNameAndBranch = false;
        } else {
          this.ifscError = '';
          this.payeeForm.controls.bankName.setValue(data.BANK);
          this.payeeForm.controls.bankAddress.setValue(data.BRANCH);
          this.payeeForm.controls.ifsc.setValue(
            $event.target.value.toString().toUpperCase()
          );
          this.disabledBankNameAndBranch = true;
        }
        this.cdr.detectChanges();
      });
  }

  sendOTP() {
    // Return early if file size validation fails
    if (!this.fileSizeValid) {
      this.errors = this.errors.filter(err => !err.includes('File size exceeds'));
      this.errors.push('File size exceeds the maximum limit of 5MB');
      this.cdr.detectChanges();
      return;
    }

    this.removeOldErrors();
    let data = this.accountNumber?.value.replaceAll(/\s/g, '');
    console.log(this.accountNumber?.value.replaceAll(/\s/g, ''));

    const values = Object.keys(this.payeeForm.controls).reduce(
      (acc: any, key: string) => ({
        ...acc,
        [key]: this.payeeForm.controls[key].value
      }),
      {}
    );

    const isNotNullOrEmptyString = this.utilityService.isNotNullOrEmptyString;

    if (!data.toString().match(this.specialCharacterCheck)) {
      this.errors.push('Invalid Account Number');
      return;
    }
    this.accountNumber?.setValue(data);
    this.cdr.detectChanges();
    if (!this.payeeForm.valid && !this.submitted) {
      console.log('Invalid form values found');
      this.findInvalidControls(this.payeeForm);
      this.cdr.detectChanges();
      return;
    }

    // check if both the values are not there
    const hasBankAccount =
      isNotNullOrEmptyString(values.ifsc) &&
      isNotNullOrEmptyString(values.accountNumber) &&
      isNotNullOrEmptyString(values.bankName) &&
      isNotNullOrEmptyString(values.bankAddress);

    if (!hasBankAccount && !isNotNullOrEmptyString(values.vpa)) {
      if (this.upiPayoutEnabled)
        this.errors.push(
          'Please enter Complete Bank Account Details or UPI ID to create a payee'
        );
      else {
        this.errors.push('Please enter bank details.');
      }
      return;
    }

    if (this.isAdmin) {
      this.spinner.show();

      if (this.bankVerification) {
        this.getAccountDetails();
      } else {
        this.onSubmit();
      }

      return;
    }
    // console.log(toFormData(this.payeeForm.value));
    // validate form
    // only progress if form is valid

    //  if valid form
    //  disable all fields
    // open OTP verification modal
    console.log('opening modal');
    const modalRef: NgbModalRef & {
      componentInstance: OtpModalComponent;
    } = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.doClose = modalRef;
    modalRef.componentInstance.templateId = smsMsg91TemplateId.payeeOtp;
    modalRef.componentInstance.passOtp.subscribe((otp: number) => {
      if (otp) {
        this.payeeForm.patchValue({
          otp: otp.toString()
        });
        console.log(this.payeeForm.value);
        this.spinner.show();
        if (this.bankVerification) {
          this.getAccountDetails();
        } else {
          this.onSubmit();
        }
      } else {
        console.log('something went with modal');
      }
    });
  }

  removeOldErrors() {
    this.errors = [];
    this.cdr.detectChanges();
  }

  goBack() {
    // this.router.navigate([`/super-admin/merchant/${this.merchantId}`]);
    this.location.back();
  }

  getAccountDetails() {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.removeOldErrors();

    //console.log(this.payeeForm.value);

    if (!this.payeeForm.valid && !this.submitted) {
      console.log('Invalid form values found');
      this.findInvalidControls(this.payeeForm);
      this.cdr.detectChanges();
      return;
    }

    this.submitted = true;
    this.cdr.detectChanges();

    this._loading$.next(true);
    console.log(this.payeeForm.value);

    this.payeeService
      .fetchAccountDetails(
        {
          ifsc: this.payeeForm.value.ifsc,
          bankAccountNumber: this.payeeForm.value.accountNumber,
          name: this.payeeForm.value.accountHolder,
          mobile: this.payeeForm.value.mobile
        },
        this.merchantId
      )
      .subscribe(
        (resp: any) => {
          this._loading$.next(false);
          if (resp.success) {
            this.accountHolderName =
              resp.result.bankDetails.beneficiary_name_with_bank;
            this.showAccountDetails(this.detailsTemplate);
            this.spinner.hide();
            return;
            // let confirmation = confirm(
            //   `Account holder name is ${name}. Do you want to proceesd and add as a payee?`
            // );
            // if (confirmation) {
            //   this.onSubmit();
            //   return;
            // } else {
            //   this._loading$.next(false);
            //   this.submitted = false;
            //   this.cdr.detectChanges();
            //   return;
            // }
          } else {
            this.submitted = false;
            this.errors = resp.errors;
            this.cdr.detectChanges();
            this.spinner.hide();
            // this.alertPayeeCreated(false);
          }
          // Show error
        },
        err => {
          this._loading$.next(false);
          this.submitted = false;
          this.spinner.hide();

          if (err.status === 0) {
            this.errors = ['Connection Error'];
          } else {
            this.errors = err.error.errors;
          }
          this.cdr.detectChanges();
        }
      );
  }

  onCancel() {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.removeOldErrors();
    this.detailsModal?.close();
    this._loading$.next(false);
    this.submitted = false;
    this.cdr.detectChanges();
  }

  onSubmit() {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.removeOldErrors();
    this.spinner.show();
    this.detailsModal?.close();
    //console.log(this.payeeForm.value);

    if (!this.payeeForm.valid && !this.submitted && !this.nameError) {
      console.log('Invalid form values found');
      this.findInvalidControls(this.payeeForm);
      this.cdr.detectChanges();
      return;
    }

    this.submitted = true;
    this.cdr.detectChanges();

    this._loading$.next(true);
    console.log(this.payeeForm.value);

    if (
      this.accountHolderName &&
      this.accountHolderName !== this.payeeForm.value.accountHolder
    ) {
      this.accountHolder?.setValue(this.accountHolderName);
    }

    this.payeeService
      .addPayee(
        toFormData(this.payeeForm.value),
        this.merchantId,
        this.payeeId,
        this.editMode
      )
      .subscribe(
        resp => {
          this._loading$.next(false);
          if (resp.success) {
            // Redirect

            if (this.isAdmin) {
              this.toastBody = this.editMode
                ? 'Successfully updated payee.'
                : 'Successfully added payee.';
              this.toastHead = 'Success';
              this.showToast(this.toastHead, this.toastBody, {
                headerClasses: 'bg-success text-white'
              });
              this.emitCloseModal.emit(true);

              this.router.navigate([
                environment.urlAdminPrefix + `/merchant/${this.merchantId}`
              ]);
            } else {

              if (this.merchantProfile?.payeeAuthorizerSettings?.enabled) {
                this.toastBody = 'Request has been sent to Authorizer';
                this.toastHead = 'Success';
                this.showToast(this.toastHead, this.toastBody, {
                  headerClasses: 'bg-success text-white'
                });
              }
              this.router.navigate([environment.urlPortalPrefix + '/payee'])
            }
            // this.alertPayeeCreated(true);
            this.spinner.hide();
          } else {
            this.submitted = false;
            this.errors = resp.errors;
            this.spinner.hide();
            this.cdr.detectChanges();
            // this.alertPayeeCreated(false);
          }
          // Show error
        },
        err => {
          this._loading$.next(false);
          this.submitted = false;
          this.spinner.hide();
          if (err.status === 0) {
            this.errors = ['Connection Error'];
          } else {
            this.errors = err.error.errors;
          }
          this.cdr.detectChanges();
        }
      );
  }

  // alertPayeeCreated(res: boolean): void {
  //   const modalOptions: NgbModalOptions = {
  //     size: 'md',
  //     backdrop: 'static',
  //     centered: true
  //   };
  //
  //   const modalRef = this.modalService.open(
  //     AlertPayeeCreationComponent,
  //     modalOptions
  //   ); // Added Modal Component here
  //   modalRef.componentInstance.result = res;
  //
  //   modalRef.result
  //     .then(result => {
  //       if (result === 'ap') {
  //         this.payeeForm.reset();
  //         this.router.navigate(['/payee', {}]);
  //       } else if (result === 'ft') {
  //       }
  //     })
  //     .catch(result => {
  //       this.payeeForm.reset();
  //     });
  // }

  showAccountDetails(modal: TemplateRef<any>) {
    this.detailsModal = this.modalService.open(modal, {
      backdrop: 'static',
      size: 'md'
    });
  }

  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 7000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }

  verifyVPA() {
    this._verifyingVPA$.next(true);
    const vpa = this.payeeForm.value.vpa;
    this.payeeService.verifyVPA(vpa).subscribe(
      resp => {
        this._verifyingVPA$.next(false);
        if ((resp as any).result && (resp as any).result.name)
          this.vpaHolderName = (resp as any).result.name;
        else this.vpaHolderNameError = "Couldn't validate UPI ID";
        this.cdr.detectChanges();
      },
      err => {
        console.log(err);
        this._verifyingVPA$.next(false);
        this.cdr.detectChanges();
      }
    );
  }

  onUpdate() {
    const updatedValues: Partial<PayeeDetail> = {};

    // Compare current form values with initial values
    for (const key in this.payeeForm.value) {
      if (key != 'otp' && this.payeeForm.value[key] !== this.payeeInitialData[key]?.toString()) {
        updatedValues[key as keyof PayeeDetail] = this.payeeForm.value[key] || '';
      }
    }

    if (this.isAdmin) {
      updatedValues['merchantId'] = this.merchantId;
    }


    if (Object.keys(updatedValues).length > 0) {
      console.log(updatedValues);
      this.payeeService.updatePayee(updatedValues, this.merchantId, this.payeeId, this.isAdmin).subscribe(
        resp => {
          if (resp.success) {
            this.showToast('Success', 'Values updated Successfully', {
              headerClasses: 'bg-success text-white'
            });
          } else {
            let errors = resp.errors;
            this.showToast('Failed', errors.pop() as string, {
              headerClasses: 'bg-danger text-white'
            });
            this.ngOnInit();
          }
          this.submitted = true;
          this.editMode = false;
          this.payeeIdProvided = true;
          this.cdr.detectChanges();
        },
        err => {
          let errors = err.error.errors[0];
          this.showToast('Failed', errors as string, {
            headerClasses: 'bg-danger text-white'
          });
          this.editMode = false;
          this.submitted = true;
          this.payeeIdProvided = true;
          this.ngOnInit();
          this.cdr.detectChanges();
        }
      );
    } else {
      this.showToast('Failed', 'No values to update', {
        headerClasses: 'bg-danger text-white'
      });
    }
  }
}

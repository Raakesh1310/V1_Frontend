import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChildren
} from '@angular/core';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat
} from 'ngx-intl-tel-input';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { AuthService } from '@modules/auth/services';
import smsMsg91TemplateId from '../../../../config/smsMsg91TemplateId';
import { KycWidgetsService } from '@modules/kyc-widgets/services';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { kycDataModel, statuses } from '@modules/kyc-widgets/models';
import { UtilityService } from '@common/services';

enum states {
  initial,
  otp,
  email,
  error
}

enum businessTypes {
  Business = 'Business Details',
  Company = 'Company',
  Individual = 'Individual'
}

@Component({
  selector: 'sbpro-mobile-email-verify',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mobile-email-verify.component.pug',
  styleUrls: ['./mobile-email-verify.component.scss']
})
export class MobileEmailVerifyComponent implements OnInit {
  @ViewChildren('formRow') rows: any;
  separateDialCode = false;
  state = states;
  selectedState: states = states.initial;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [
    CountryISO.India,
    CountryISO.UnitedStates
  ];
  phoneForm!: FormGroup;
  otpForm!: FormGroup;
  formInput = ['input1', 'input2', 'input3', 'input4'];
  showOtpSubmitButton = false;
  hideResendOtpText = false;
  showEmailSubmitButton = false;
  crnId = '';
  moveToNextPage = false;
  mobilePresent = false;
  timer = false;
  counter = 30;

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private kycService: KycWidgetsService,
    private route: ActivatedRoute,
    private router: Router,
    private utilityService: UtilityService
  ) {
    this.phoneForm = this.formBuilder.group({
      phone: ['', [Validators.required]],
      email: ['', [Validators.required]],
      name: ['', [Validators.required]],
      otp: ['', [Validators.required]]
    });
    this.otpForm = this.toFormGroup(this.formInput);
  }

  ngOnInit(): void {
    this.crnId = this.route.snapshot.params.crnId;
    this.getKycData();
  }

  toFormGroup(elements: Array<string>) {
    const group: any = {};
    elements.forEach(key => {
      group[key] = new FormControl('', Validators.required);
    });
    return this.formBuilder.group(group);
  }

  keyUpEvent(event: any, index: number) {
    console.log(index, event.target.value, ' ', event.which);
    // to show otp submit button...
    if (index === 3 && event.target.value) {
      this.showOtpSubmitButton = true;
    } else {
      this.showOtpSubmitButton = false;
    }
    if (
      (event.which >= 96 && event.which <= 105) ||
      (event.which >= 48 && event.which <= 57)
    ) {
      if (event.target.value) {
        index = index + 1;
      }
    } else if (event.which === 8) {
      // event.which === 8, represents backspace
      index = index - 1;
    }
    if (index > -1 && index < this.formInput.length) {
      this.rows._results[index].nativeElement.focus();
    }
    this.cdr.detectChanges();
  }

  checkValue(value: string): boolean {
    return value.length !== 1;
  }

  checkNumber(value: string) {
    this.moveToNextPage = value.length === 10;
    this.cdr.detectChanges();
    console.log(value.length);
  }

  checkEmail() {
    // const data = this.phoneForm.controls['email'].value;
    // const regexResult = RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/).test(
    //     this.phoneForm.controls['email'].value
    //   ); 
    // const makeItThough = this.phoneForm.controls['name'].value
    if (
      RegExp(/^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z\-]+\.)+[A-Za-z]{2,}))$/).test(
        this.phoneForm.controls['email'].value
      ) &&
      this.phoneForm.controls['name'].value
    ) {
      this.showEmailSubmitButton = true;
      this.cdr.detectChanges();
    } else {
      this.showEmailSubmitButton = false;
      this.cdr.detectChanges();
    }
  }

  resendOtp() {
    if (this.timer === true) return;
    this.timer = true;
    const resendOtp = setInterval(() => {
      this.counter -= 1;
      if (this.counter === 0) {
        this.timer = false;
        this.counter = 30;
        clearInterval(resendOtp);
      }
      this.cdr.detectChanges();
    }, 1000);
    let phone = this.phoneForm.controls['phone'].value;
    console.log(phone);
    let trimmedNumber = phone
      .substring(0, phone.length)
      .trim()
      .replace(/\s/g, '');
    console.log(trimmedNumber);
    this.authService
      .resendKYCOTP(trimmedNumber, smsMsg91TemplateId.registerMobileOtp)
      .subscribe(resp => {
        console.log('otp sent...', resp);
        this.selectedState = states.otp;
        this.cdr.detectChanges();
      });
  }

  moveToOtp() {
    let phone = this.phoneForm.controls['phone'].value;
    console.log(phone);
    let trimmedNumber = phone
      .substring(0, phone.length)
      .trim()
      .replace(/\s/g, '');
    console.log(trimmedNumber);
    if (phone !== null && trimmedNumber.length === 10) {
      this.authService
        .sendKYCOTP(trimmedNumber, smsMsg91TemplateId.registerMobileOtp)
        .subscribe(resp => {
          console.log('otp sent...', resp);
          this.selectedState = states.otp;
          this.mobilePresent = true;
          // this.phoneForm.controls['phone'].disable();
          this.cdr.detectChanges();
        });
    } else {
      let toastHead = 'Mobile Number Error';
      let text = '';
      if (phone === null || phone.length === 0) {
        text = 'empty';
      } else {
        text = 'not valid';
      }
      let toastBody = `${phone?.number || 'Mobile No'} is ${text}.`;
      this.kycService.showToast(toastHead, toastBody, {
        headerClasses: 'bg-danger text-white'
      });
    }
    this.cdr.detectChanges();
  }

  onSubmit() {
    console.log(this.otpForm);
    let s = '';
    for (const name in this.otpForm.controls) {
      if (this.otpForm.controls[name].valid) {
        s += this.otpForm.controls[name].value;
      }
    }
    console.log(s);
    this.phoneForm.controls['otp'].setValue(s);
    if (s.length === 4) {
      this.otpVerification();
    }
  }

  otpVerification() {
    let mobile = this.phoneForm.controls['phone'].value;
    let body = {
      mobile: mobile.substring(0, mobile.length).replace(/\s/g, ''),
      otp: this.phoneForm.controls['otp'].value
    };
    console.log('OTP BODY ', body);
    let toastHead = '';
    let toastBody = '';
    this.kycService.otpVerify(body, this.crnId).subscribe(
      (resp: any) => {
        console.log('DATA PATCHED ', resp);
        if (resp.success) {
          toastHead = 'Verification';
          toastBody = 'OTP Successfully Verified';
          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
          this.showOtpSubmitButton = false;
          this.hideResendOtpText = true;
          this.mobilePresent = true;
          this.selectedState = states.email;
        } else {
          toastHead = 'Error';
          toastBody = resp.errors;
          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          console.log('ERROR ', resp.errors);
        }
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        toastHead = 'Error';
        if (err.status === 0) {
          console.log('Connection Error');
          toastBody = 'Connection Error';
        } else {
          toastBody = err.error.errors;
          console.log(err.error.errors);
        }
        this.kycService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
      }
    );
  }

  patchKycData() {
    let body = {
      name: this.phoneForm.controls['name'].value,
      email: this.phoneForm.controls['email'].value
      //'mobile': this.phoneForm.controls['phone'].value
    };
    let toastHead = '';
    let toastBody = '';
    let params = {};
    this.kycService.patchKycData(this.crnId, body, params).subscribe(
      (resp: any) => {
        console.log('DATA PATCHED ', resp);
        if (resp.success) {
          let data: kycDataModel = this.kycService.kycDataMapping(resp.result);
          if (data.status === statuses.Completed) {
            this.router
              .navigate(['/kyc/success' + '/' + this.crnId])
              .then(r => r);
          } else {
            let page: string | undefined = '';
            if (data.businessType === businessTypes.Company) {
              page = data.page === '' ? businessTypes.Business : data.page;
            } else if (data.businessType === businessTypes.Individual) {
              page = data.page === '' ? businessTypes.Individual : data.page;
            } else {
              page = data.page;
            }
            this.router
              .navigate(['/kyc/business-Details' + '/' + this.crnId], {
                queryParams: {
                  page: page,
                  kycType: this.checkForBusinessType(data.businessType)
                }
              })
              .then(r => r);
          }
        } else {
          toastHead = 'Error';
          toastBody = resp.errors;
          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
          console.log('ERROR ', resp.errors);
        }
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        toastHead = 'Error';
        if (err.status === 0) {
          console.log('Connection Error');
          toastBody = 'Connection Error';
        } else {
          console.log(err.error.errors);
          toastBody = err.error.errors;
        }
        this.kycService.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.cdr.detectChanges();
      }
    );
  }

  getKycData() {
    let params = {};
    let url = environment.apiPrefix + `/kyclink/${this.crnId}`;
    this.kycService.getKycData(url, params).subscribe(
      (resp: any) => {
        console.log('USER KYC DETAIL ', resp);
        if (resp.success) {
          let data: kycDataModel = this.kycService.kycDataMapping(resp.result);
          this.phoneForm.controls['name'].setValue(data.name);
          this.phoneForm.controls['email'].setValue(data.email);
          this.phoneForm.controls['phone'].setValue(
            data.mobile ? data.mobile.toString() : ''
          );
          if (data.mobile) {
            this.mobilePresent = true;
          }
          this.checkNumber(data.mobile ? data.mobile.toString() : '');
          this.checkEmail();
        } else {
          console.log('ERROR ', resp.errors);
        }
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
        } else {
          console.log(err.error.errors);
        }
        this.cdr.detectChanges();
      }
    );
  }

  /**
   * Making business Type as Company for every
   * business type other than Individual.
   */
  checkForBusinessType(businessType: string): string {
    if (
      businessType === 'Company' ||
      businessType === 'Sole Proprietor' ||
      businessType === 'LLP' ||
      businessType === 'PartnerShip'
    ) {
      return 'Company';
    } else {
      return 'Individual';
    }
  }
}

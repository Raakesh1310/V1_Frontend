import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { BooleanResponseModel } from '@common/models/boolean-response.model';
import { ToastService, UtilityService } from '@common/services';
import { UserFormControlType } from '@modules/users/constants/loginLocksType.enum';
import {
  IUserDetail,
  IUserDetailsResponseModel
} from '@modules/users/models/user-details.model';
import { AllUsersService } from '@modules/users/services';
import { environment } from 'environments/environment';
import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'sbpro-user-basic-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-basic-details.component.pug',
  styleUrls: ['user-basic-details.component.scss']
})
export class UserBasicDetailsComponent implements OnInit {
  @Input() private userId = '';

  userForm!: FormGroup;
  userFormControls!: UserFormControlType;
  private _loadingData$ = new BehaviorSubject(false);
  private _updating$ = new BehaviorSubject(false);
  errors: string[] = [];
  loginLock = false;
  loginOTPEnabled = false;
  isSuperAdmin = false;
  kycVerified = false;

  get loadingData$(): Observable<boolean> {
    return this._loadingData$.asObservable();
  }

  get updating$(): Observable<boolean> {
    return this._updating$.asObservable();
  }

  constructor(
    private allUsersService: AllUsersService,
    private cdr: ChangeDetectorRef,
    private utilityService: UtilityService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    this.userForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      businessName: ['', Validators.required],
      email: ['', Validators.required],
      mobile: ['', Validators.required],
      createdAt: [''],
      loginLock: [false],
      isSuperAdmin: [false],
      kycVerified: [false],
      loginOTPEnabled: [false]
    });
    this.userFormControls = this.userForm.controls as any;
  }

  ngOnInit() {
    this._loadingData$.next(true);

    this.allUsersService.findUser(this.userId).subscribe(
      (resp: IUserDetailsResponseModel) => {
        this._loadingData$.next(false);
        if (resp.result) {
          this.userFormControls.firstName.setValue(resp.result.firstName);
          this.userFormControls.lastName.setValue(resp.result.lastName);
          this.userFormControls.businessName.setValue(resp.result.businessName);
          this.userFormControls.email.setValue(resp.result.email);

          this.isSuperAdmin = resp.result.isSuperAdmin;
          this.userFormControls.isSuperAdmin.setValue(this.isSuperAdmin);

          this.kycVerified = resp.result.kycVerified;
          this.userFormControls.kycVerified.setValue(this.kycVerified);

          this.loginLock = !_.isUndefined(resp.result.loginLock);
          this.userFormControls.loginLock.setValue(this.loginLock);

          this.loginOTPEnabled = resp.result.loginOTPEnabled;
          this.userFormControls.loginOTPEnabled.setValue(this.loginOTPEnabled);

          this.userFormControls.mobile.setValue(resp.result.mobile);
          this.userFormControls.createdAt.setValue(resp.result.createdAtString);
        } else {
          this.goBack();
        }
      },
      err => {
        console.log(err);
        this.goBack();
      }
    );
  }

  goBack() {
    this.router.navigate([environment.urlAdminPrefix + '/all-users']);
  }

  changeCheckbox(formControlName: string, event: Event) {
    const value: boolean = (event.target as HTMLInputElement).checked;
    if (formControlName === 'loginLock') {
      this.loginLock = value;
      this.userFormControls.loginLock.setValue(value);
    }
    if (formControlName === 'loginOTPEnabled') {
      this.loginOTPEnabled = value;
      this.userFormControls.loginOTPEnabled.setValue(value);
    }
    if (formControlName === 'isSuperAdmin') {
      this.isSuperAdmin = value;
      this.userFormControls.isSuperAdmin.setValue(value);
    }
    if (formControlName === 'kycVerified') {
      this.kycVerified = value;
      this.userFormControls.kycVerified.setValue(value);
    }
    this.cdr.detectChanges();
  }
  update() {
    this._updating$.next(true);
    const formData: Partial<IUserDetail> = {};

    if (this.userFormControls.firstName.dirty) {
      formData.firstName = this.userFormControls.firstName.value;
    }
    if (this.userFormControls.lastName.dirty) {
      formData.lastName = this.userFormControls.lastName.value;
    }
    if (this.userFormControls.businessName.dirty) {
      formData.businessName = this.userFormControls.businessName.value;
    }
    if (this.userFormControls.email.dirty) {
      formData.email = this.userFormControls.email.value;
    }
    if (this.userFormControls.isSuperAdmin.dirty) {
      formData.isSuperAdmin = this.userFormControls.isSuperAdmin.value;
    }
    if (this.userFormControls.kycVerified.dirty) {
      formData.kycVerified = this.userFormControls.kycVerified.value;
    }
    if (this.userFormControls.loginLock.dirty) {
      formData.loginLock = this.userFormControls.loginLock.value;
    }
    if (this.userFormControls.loginOTPEnabled.dirty) {
      formData.loginOTPEnabled = this.userFormControls.loginOTPEnabled.value;
    }
    if (this.userFormControls.mobile.dirty) {
      formData.mobile = this.userFormControls.mobile.value;
    }

    this.allUsersService.update(this.userId, formData).subscribe(
      (resp: BooleanResponseModel) => {
        this._updating$.next(false);
        if (resp.success) {
          this.showToast('Success', 'Update Success', {
            headerClasses: 'bg-success text-white'
          });
        } else {
          this.showToast('Error', 'Update Error', {
            headerClasses: 'bg-danger text-white'
          });
        }
        this.cdr.detectChanges();
      },
      (err: any) => {
        this._updating$.next(false);
        this.showToast('Error', 'Update Error', {
          headerClasses: 'bg-danger text-white'
        });
        this.errors = err.error.errors;
        this.cdr.detectChanges();
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
}

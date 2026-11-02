import { AbstractControl } from '@angular/forms';

export enum LoginLockTypes {
  ADMIN_LOCK = 'admin_lock',
  ATTEMPT_EXCEEDED_LOCK = 'attempt_exceeded_lock',
  NONE = 'none'
}
export type UserFormControlType = {
  firstName: AbstractControl;
  lastName: AbstractControl;
  businessName: AbstractControl;
  email: AbstractControl;
  mobile: AbstractControl;
  createdAt: AbstractControl;
  loginLock: AbstractControl;
  isSuperAdmin: AbstractControl;
  kycVerified: AbstractControl;
  loginOTPEnabled: AbstractControl;
};

import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { LoginLockTypes } from '../constants/loginLocksType.enum';

export interface IUserDetailsResponseModel extends BaseApiResponseModel {
  result: IUserDetail;
}

export interface IUserDetail extends IUserInput {
  _id: string;
  password: string;
  role: string;
  salt: string;
  image: string;
  createdBy: IUserDetail;
  active: boolean;
  kycVerified: boolean;
  isSuperAdmin: boolean;
  gAuthEnabled: boolean;
  gAuthSecret: string;
  whatsapp: boolean;
  loginOTPEnabled: boolean;
  totalFailedLoginAttempt: number;
  loginLock: LoginLockInterface;
  createdAtString: Date;
  expireDate: Date;
}

export interface IUserInput extends UserBasicInfo {
  whatsapp: boolean;
  password: string;
}

export interface LoginLockInterface {
  reason: string;
  lockType: LoginLockTypes;
  // totalLoginAttempt?: number;
  lockedAt: Date;
  lockedBy: IUserDetail;
}

export interface IUserResetPassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IUserForgotPassword {
  newPassword: string;
  confirmPassword: string;
}

/**
 * Basic Info
 */
export interface UserBasicInfo {
  /**
   * This is Actually the Authorized Person Name
   */
  businessName: string;
  firstName: string;
  lastName: string;
  mobile: number;
  email: string;
}

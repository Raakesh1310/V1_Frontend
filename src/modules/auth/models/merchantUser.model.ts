import { User } from '@modules/auth/models/auth.model';
import { Merchant } from '@modules/auth/models/merchant.model';

export interface MerchantUser extends MerchantUserDetail {
  _id: string;
  otpSend?: boolean;
  roleStringStruct?: string[];
}

export interface MerchantUserDetail extends MerchantUserInputs {
  user: User;
  merchant: Merchant;
  merchantId: string;
  merchantUserId: string;
  active: boolean;
  resetPassword: boolean;
  verificationString?: string;
  depositTabAccess?: boolean;
  access: {
    accounts?: string[];
    payee?: string[];
    transfer?: string[];
    passbook?: string[];
    escrowPage?: string[];
    challan?: string[];
    escrowQR?: string[];
    bankAccounts?: string[];
    connectedBankingTransfer?: string[];
    bankAccountTransfer?: string[];
    depositList?: string[];
  };
}

export interface MerchantUserTeamMember {
  merchantId?: string;
  firstName: string;
  lastName: string;
  mobile: number;
  email: string;
  role: string;
  access: {};
  accounts?: [];
  bankAccounts?: [];
  roleName: string;
}

export interface MerchantUserToken {
  token: string;
  image: string;
  gAuthRequired: boolean;
  gAuthVerified: boolean;
  loginOTPVerified?: boolean;
}

export interface MerchantUserInputs {
  roles: string[];
  role: string;
  email: string;
  mobile: string;
  firstName: string;
  lastName: string;
  phone: string;
  access: {};
  roleName: string;
}

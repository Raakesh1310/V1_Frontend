import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { merchantApprovalModel } from '@modules/approvals/models';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { MerchantUser } from '@modules/auth/models/merchantUser.model';
import { TimeStamp } from '@modules/auth/models/timestamp.model';
import { User } from '@modules/users/models';

export interface Merchant extends MerchantDetail, TimeStamp {
  _id: string;
}

export interface MerchantDetail extends MerchantInputs {
  email: string;
  merchantId: string;
  verified: boolean;
  active: boolean;
  profile: MerchantProfile;
  merchantUserOwner: MerchantUser;
  authorizations?: merchantApprovalModel[];
  remarks?: string;
}

export interface MerchantInputs {
  createdBy: User;
  title: string;
  status: string;
}

export interface MerchantResponseModel extends BaseApiResponseModel {
  result: Merchant[];
}

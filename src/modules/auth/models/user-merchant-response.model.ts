import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { User } from '@modules/auth/models/auth.model';
import { Merchant } from '@modules/auth/models/merchant.model';
import { MerchantUser } from '@modules/auth/models/merchantUser.model';

export interface UserMerchantResponseModel extends BaseApiResponseModel {
  result: MerchantUser[];
}

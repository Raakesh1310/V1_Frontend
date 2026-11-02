import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import {
  MerchantUser,
  MerchantUserToken
} from '@modules/auth/models/merchantUser.model';

export interface LoginResponseModel extends BaseApiResponseModel {
  result: MerchantUser & MerchantUserToken;
}

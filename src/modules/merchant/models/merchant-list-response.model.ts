import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Merchant } from '@modules/auth/models/merchant.model';

export interface MerchantListResponseModel extends BaseApiResponseModel {
  result: Merchant[];
}

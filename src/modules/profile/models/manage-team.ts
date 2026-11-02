import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { MerchantUser } from '@modules/auth/models/merchantUser.model';

export interface TeamResponseModel extends BaseApiResponseModel {
  result: MerchantUser[];
}

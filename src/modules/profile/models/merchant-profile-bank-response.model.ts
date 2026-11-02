import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { MerchantProfileBank } from '@modules/auth/models/merchantProfile.model';

export interface MerchantProfileBankResponseModel extends BaseApiResponseModel {
  result: MerchantProfileBank;
}

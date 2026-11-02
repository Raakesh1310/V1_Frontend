import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';

export interface ProfileResponseModel extends BaseApiResponseModel {
  result: MerchantProfile;
}

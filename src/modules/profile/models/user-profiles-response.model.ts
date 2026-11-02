import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { UserProfile } from '@modules/profile/models/profile.model';

export interface UserProfilesResponseModel extends BaseApiResponseModel {
  result: UserProfile[];
}

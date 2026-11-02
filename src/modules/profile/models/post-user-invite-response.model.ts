import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { UserProfile } from '@modules/profile/models/profile.model';

export interface PostUserInviteResponseModel extends BaseApiResponseModel {
  result: boolean;
}

import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { User } from '@modules/users/models/users.model';

export interface UpdateUserResponseModel extends BaseApiResponseModel {
  result: User;
}

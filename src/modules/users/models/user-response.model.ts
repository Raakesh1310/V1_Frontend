import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { User } from '@modules/users/models/users.model';

export interface UserResponseModel extends BaseApiResponseModel {
  result: User[];
}

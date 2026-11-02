import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { User } from '@modules/auth/models/auth.model';

export interface RegisterResponseModel extends BaseApiResponseModel {
  result: User;
}

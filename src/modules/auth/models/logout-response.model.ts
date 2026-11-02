import { BaseApiResponseModel } from '@common/models/base-api-response.model';

export interface LogoutResponseModel extends BaseApiResponseModel {
  result: boolean;
}

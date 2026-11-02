import { BaseApiResponseModel } from '@common/models/base-api-response.model';

export interface BooleanResponseModel extends BaseApiResponseModel {
  result: boolean;
}

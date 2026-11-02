import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { ChallanModel } from '@modules/challan/models/challan.model';

export interface ChallanCreateResponseModel extends BaseApiResponseModel {
  result: ChallanModel;
}

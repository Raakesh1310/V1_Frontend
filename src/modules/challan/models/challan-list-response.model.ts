import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { ChallanModel } from '@modules/challan/models/challan.model';

export interface ChallanListResponseModel extends BaseApiResponseModel {
  result: ChallanModel[];
}

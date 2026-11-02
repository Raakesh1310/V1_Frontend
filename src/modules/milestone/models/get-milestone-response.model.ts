import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { MilestoneModel } from '@modules/milestone/models/milestone.model';

export interface GetMilestoneResponseModel extends BaseApiResponseModel {
  result: MilestoneModel;
}

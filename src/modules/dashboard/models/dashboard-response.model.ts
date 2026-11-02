import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import {
  DashboardData,
  DashTopData
} from '@modules/dashboard/models/dashboard.model';

export interface DashboardResponseModel extends BaseApiResponseModel {
  result: DashboardData;
}

export interface DashboardTopResponseModel extends BaseApiResponseModel {
  result: DashTopData;
}

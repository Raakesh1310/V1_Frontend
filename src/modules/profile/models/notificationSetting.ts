import { BaseApiResponseModel } from '@common/models/base-api-response.model';

export interface NotificationSettingModel extends BaseApiResponseModel {
  result: NotificationSetting[];
}

export interface NotificationSetting {
  type: string;
  active: boolean;
}

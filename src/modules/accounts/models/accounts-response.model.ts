import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Account } from '@modules/accounts/models';

export interface AccountsResponseModel extends BaseApiResponseModel {
  result: Account[];
}

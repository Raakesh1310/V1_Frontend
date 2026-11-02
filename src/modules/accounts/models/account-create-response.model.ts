import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Account } from '@modules/accounts/models';
import { User } from '@modules/auth/models/auth.model';

export interface AccountCreateResponseModel extends BaseApiResponseModel {
  result: Account;
}

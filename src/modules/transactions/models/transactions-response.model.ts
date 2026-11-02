import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Account } from '@modules/accounts/models';
import { User } from '@modules/auth/models/auth.model';
import { Transaction } from '@modules/transactions/models/transactions.model';
import { VirtualAction } from 'rxjs';

export interface TransactionsResponseModel extends BaseApiResponseModel {
  // tslint:disable-next-line:no-any
  result: any;
}

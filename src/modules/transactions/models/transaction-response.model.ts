import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Transaction } from '@modules/transactions/models/transactions.model';

export interface TransactionResponseModel extends BaseApiResponseModel {
  result: Transaction;
}

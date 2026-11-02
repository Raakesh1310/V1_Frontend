import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Transaction } from '@modules/transactions/models';
import { Transfer } from '@modules/transfers/models';

export interface StatementRespModel extends BaseApiResponseModel {
  result: (Transfer | Transaction)[];
}

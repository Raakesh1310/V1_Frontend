import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Transfer } from '@modules/transfers/models';

export interface TransferResponseModel extends BaseApiResponseModel {
  // tslint:disable-next-line:no-any
  result: Transfer[];
}

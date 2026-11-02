import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Transfer } from '@modules/transfers/models/transfers.model';

export interface UpdateTransferResponseModel extends BaseApiResponseModel {
  result: Transfer;
}

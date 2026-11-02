import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Transfer } from '@modules/transfers/models';

export interface TransfersResponseModel extends BaseApiResponseModel {
  // tslint:disable-next-line:no-any
  result: Transfer[];
}

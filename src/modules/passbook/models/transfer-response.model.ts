import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Transfer } from '@modules/transfers/models';
import { ExcelAccountFormat } from '@modules/transfers/models/create-transfer-response.model';

export interface TransferResponseModel extends BaseApiResponseModel {
  // tslint:disable-next-line:no-any
  result: Transfer;
}


export interface TransferBulkResponseModel {
  id: string,
  status: string,
  merchantId: string,
  batchId: string,
  batchName: string,
  totalAmount: number,
  accountId: string,
  accountBalance: number,
  createdAt: string,
  updatedAt: string,
  merchantName: string,
  transferList: ExcelAccountFormat[],
}

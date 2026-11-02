import { BaseApiResponseModel } from '@common/models/base-api-response.model';
export interface BulkTransferResponseModel extends BaseApiResponseModel {
  result: {};
}
export interface BulkTransferCreateResponseModel {
  success: boolean;
  result: BulkTransferCreateResult;
}
export interface BulkTransferCreateResult {
  batchId: string;
  batchName: string;
}

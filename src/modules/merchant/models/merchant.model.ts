import { BaseApiResponseModel } from '@common/models/base-api-response.model';

export interface BillResponseModel extends BaseApiResponseModel {
  result: Bill[];
}

export interface Bill {
  billingId: string;
  billingType: string;
  billingAmount: number;
  merchantId: string;
  accountId: string;
  transferId: string;
  createdAt: string;
  updatedAt: string;
}

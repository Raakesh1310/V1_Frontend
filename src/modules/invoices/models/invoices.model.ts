import { BaseApiResponseModel } from '@common/models/base-api-response.model';

export interface InvoiceRespModel extends BaseApiResponseModel {
  result: Invoice[];
}

export interface Invoice {
  invoiceId: string;
  merchantId: string;
  month: number;
  year: number;
  totalAmount: number;
}

export interface SelectedMerchants {
  merchantId: string;
  email: string;
}

export const feeType = {
  monthly: 'Monthly Fee',
  setUpFee: 'Set Up Fee',
  virtualAccount: 'Virtual Account Fee',
  transaction: 'Transaction Fee'
};

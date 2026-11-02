import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Account } from '@modules/accounts/models';
import { Merchant } from '@modules/auth/models/merchant.model';

export interface FixedDepositInput {
  accountId: string;
  amount: string;
  fdAccountNo: string;
  tenure: number;
  valueDate: Date;
  maturityDate: Date;
}

export interface FixedDepositDetail extends FixedDepositInput {
  merchant: Merchant;
  merchantId: string;
  status: string;
  interestINR: number;
  valueDateString?: string;
  maturityDateString?:string;
  amountBlocked: string;
  fixedDepositId: string;
  account: Account;
}

export interface FixedDepositResp extends BaseApiResponseModel {
  result: FixedDepositDetail[];
}

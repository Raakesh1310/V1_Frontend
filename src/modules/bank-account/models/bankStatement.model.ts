import { BaseApiResponseModel } from '@common/models/base-api-response.model';
export interface BankStatement {
  bankAccountNo: string;
  description?: string;
  transactionTime: Date;
  amount: number;
  accountBalance: number;
  transactionType: string;
  withdraw?: number;
  credit?: number;
  statementUniqueId: string;
  narration: string;
}

export interface BankstatementRespModel extends BaseApiResponseModel {
  result: BankStatement[];
}

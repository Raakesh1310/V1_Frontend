import { BaseApiResponseModel } from '@common/models/base-api-response.model';

export interface SourceAccountValidation {
  sourceAccounts: SourceAccount[];
  sourceAccountValidation: boolean;
}
export interface SourceAccount {
  bankAccountNumber: string;
  ifsc: string;
  accountHolder: string;
  bankName: string;
  lastUpdatedAt?: Date;
  status: string;
}
export interface SourceAccountResponse extends BaseApiResponseModel {
  result: SourceAccountValidation;
}

export interface InputSourceAccount {
  sourceAccount: SourceAccount;
}

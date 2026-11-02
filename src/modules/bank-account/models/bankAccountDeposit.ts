import { BaseApiResponseModel } from "@common/models/base-api-response.model";

export interface BankAccountDepositInterface {
  depositDate: Date;
  bankAccountNo: string;
  bankName: string;
  description: string;
  amount: number;
}

export interface bankAccountDepositResp extends BaseApiResponseModel{
    result : BankAccountDepositInterface[];
}

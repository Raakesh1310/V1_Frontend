import { BaseApiResponseModel } from "@common/models/base-api-response.model";

export interface BankAccount {
    merchantId: string | null;
    bankAccountNo: string;
    accountName: string;
    bankName: string;
    accountType: string;
    balance?: number;
    effectiveBalance?: number;
    status?: string;
}

export interface BankAccountResp extends BaseApiResponseModel {
    result: BankAccount[];
}

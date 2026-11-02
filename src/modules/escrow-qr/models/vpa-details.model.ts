import { Account } from "@modules/accounts/models";
import { Merchant } from "@modules/auth/models/merchant.model";

export interface QRDetails {
    vpa: string;
    status: string;
    qrId: string;
    amount?: number;
    fixedAmount: boolean;
    purpose: string;
    accountId: string;
    accountName: string;
    account: Account;
    depositCount: number;
    bank: string;
    merchant: Merchant;
    merchantId: string;
    merchantName: string;
    qr: string;
    webhook: string;
    createdAt?: string;
  }
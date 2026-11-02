import { AccountDocumentDetail } from '@modules/accounts/models';
import { Merchant } from '@modules/auth/models/merchant.model';

export interface Transfer {
  document: AccountDocumentDetail[];
  authorization: Authorization[];
  payeeId: string;
  frequency: string;
  remainingPayments: number;
  startDate: string;
  recurring: boolean;
  otp: number;
  _id: string;
  transferId: string;
  userId: string;
  amount: number;
  beneficiaryName: string;
  beneficiaryIFSC: string;
  beneficiaryBankName: string;
  description: string;
  beneficiaryAccNumber: string;
  bankName: string;
  accountId: string;
  status: string;
  createdAt: string;
  createdAtParsed: Date;
  purpose: string;
  merchantId?: string;
  accountAuthorizers?: AuthTransferStruct[];
  merchantAuthorizers?: AuthTransferStruct[];
  utr: string;
  businessName: string;
  remarks: string;
  transferType?: string;
  merchant: Merchant;
  documentIds?: string[] | undefined;
  vpa?: string;
  upiId?: string;
  createdBy: string;
  bankAccountNumber?: string;

  notes: {
    [key: string]: string;
  };
}

export interface Authorization {
  email: string;
  verified: boolean;
  verifiedAt: string;
  verificationId: string;
  data: {
    priority: number;
    approved: boolean;
  };
}

export interface TransferAuthorizerStruct {
  _id?: string;
  deleted?: boolean;
  name: string;
  email: string;
}

export interface AuthModel {
  id: number;
  itemName: string;
  data: TransferAuthorizerStruct;
}

export interface AuthTransferStruct {
  name: string;
  email: string;
}

export interface TransferDocumentDetail {
  deleted: boolean;
  documentId: string;
  transferId?: string;
  name: string;
  hash: string;
  docType: string;
  deleting?: boolean;
}

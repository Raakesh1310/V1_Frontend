import { AccountDocumentDetail } from '@modules/accounts/models';
import { Merchant } from '@modules/auth/models/merchant.model';
import { Transfer } from './transfers.model';

export interface BulkTransfer {
  document: AccountDocumentDetail[];
  authorization: Authorization[];
  _id: string;
  batchId: string;
  totalAmount: number;
  accountId: string;
  status: string;
  createdAt: string;
  createdAtParsed: Date;
  purpose: string;
  transferList: Transfer[];
  utr: string;
  businessName: string;
  remarks: string;
  merchant: Merchant;

  createdBy: string;
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

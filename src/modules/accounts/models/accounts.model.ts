import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Merchant } from '@modules/auth/models/merchant.model';
import { Payee } from '@modules/payee/models';
import { Signer } from 'crypto';

/**
 * ########################
 * code refactor interfaces
 * ########################
 */

// Account Cache
export interface AccountCache {
  accountDescription: AccountDescriptionDetail;
  accountPayee: AccountPayeeDetail[];
}

// Account Description
export interface AccountDescriptionRespModel extends BaseApiResponseModel {
  result: AccountDescriptionDetail;
}

export interface AccountDescriptionDetail extends AccountDescriptionInput {
  account?:string;
  accountId: string;
}

export interface AccountDescriptionInput {
  name: string;
  purpose: string;
  email: string;
  validity: number;
  startDate: string;
  expectedVolume: number;
  status: string;
  feeDetails: object;
  bank: string;
}

// Account Payee
export interface AccountPayeeInput {
  shareUnit: string;
  payee: AccountPayeeForm;
}

export interface AccountPayeeDraft extends AccountPayeeForm {
  accountPayeeId: string;
}

export interface AccountPayeeForm {
  payeeId: string;
  email: string;
  share: number;
  name: string;
}

export interface AccountPayeeDetail {
  payeeId: string;
  email: string;
  share: number;
  balance: number;
  accountHolder: string;
  ifsc: string;
  accountNumber: string;
  mobile: number;
  bankAddress: string;
  bankName: string;
  vpa?: string;
}

export interface AccountPayeeRespModel extends BaseApiResponseModel {
  result: AccountPayeeDetail[];
}

export interface AccountDocumentDetail {
  deleted: boolean;
  documentId: string;
  accountId: string;
  name: string;
  hash: string;
  docType: string;
}

// Account Documents
export interface AccountDocumentRespModel extends BaseApiResponseModel {
  result: AccountDocumentDetail[];
}

/**
 * old interfaces
 */
export interface Account {
  // [key: string]: string | number | AccountPayee[];
  id: number;
  _id: string;
  accountId: string;
  ifsc: string;
  name: string;
  email: string;
  dashboardAccess: string;
  allowRefunds: string;
  status: string;
  startDate: Date;
  shareUnit: string;
  balance: number;
  validity: number;
  purpose: string;
  payees: AccountPayeeDetail[];
  payeesInfo: Payee[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  agreements: Agreement[];
  orders: Order[];
  merchant: Merchant;
  merchantId: string;
  authorizers: AccountInputAuthorizerInterface[];
  expectedVolume: number;
  bank: string;
  isAutoTransfer: string;
  retentionAmount: string;
  vpa: string;
  merchantTitle?: string;
  autoScheduledAt?: string;
  autoTransferType?: string;
}

export interface AccountInputAuthorizerInterface {
  name: string;
  email: string;
  mobile: string;
  _id?: string;
  deleted?: boolean;
}

export interface Agreement {
  documentId: string;
  type: string;
  accountId: string;
  name: string;
  hash: string;
}

export interface Order {
  orderUuid: string;
  fileName: string;
  documentUuid: string;
  documentId: string;
  signingParties: Signer[];
}

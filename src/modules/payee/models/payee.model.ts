import { User } from '@modules/auth/models';

export interface Payee extends PayeeDetail {
  [key: string]: string | number | object | Array<PayeeDocuments>;
  id: number;
  createdAt: string;
}

export interface PayeeDetail {
  payeeId: string;
  merchantId: string;
  // user: IUser;
  accountNumber: number;
  accountHolder: string;
  ifsc: string;
  bankName: string;
  bankAddress: string;
  mobile: string;
  email: string;
  balance: string;
  docs: Array<PayeeDocuments>;
  createdBy: string;
  documents: Array<PayeeDocuments>;
}

export interface PayeeDocuments {
  docCancelledCheque: string;
  // docCancelledChequeObject: any;
  docCancelledChequeOriginal: string;
  file: string;
  serverFile: string;
}

export interface uploadPayeeData {
  accountNumber: string;
  accountHolder: string;
  ifsc: string;
  bankName: string;
  bankAddress: string;
  mobile: string;
  email: string;
  rowNumber: number;
  remarks: string[];
  vpa?: string;
}

export interface uploadPayeeApiData {
  accountNumber: string;
  accountHolder: string;
  ifsc: string;
  bankName: string;
  bankAddress: string;
  mobile: string;
  email: string;
}

// export enum MultiPayeeStatus {
//   upload,
//   submit,
//   moveToPayeeList
// }

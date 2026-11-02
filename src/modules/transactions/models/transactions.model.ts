export interface Transaction {
  [key: string]: string | number | Date;

  _id: string;

  transactionId: string;
  currency: string;

  // user: IUser;

  // account: IAccount;
  merchantCode: string;
  virtualAccNumber: string;
  amount: number;
  paymentMode: string;
  utrNumber: string;
  remitterName: string;
  remitterAccNumber: string;
  remitterIFSCCode: string;
  status: string;
  date: number;
  dateParsed: Date;
  senderInformation: string;
  remitterBankName: string;
}

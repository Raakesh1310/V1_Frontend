export interface ICICIAccountResult {
  ifsc: string;
  trusteeMail: string | undefined;
  accountCode?: string;
  accountPrefix?: string;
  deleted: boolean;
  _id: string;
  merchantId: string;
  corpId: string;
  makerId: string;
  checkerId: string;
  approverId: string;
  statusApproverId: string;
  statusAccountId: string;
  accountNo: string;
  accountClientId: string;
  accountName: string;
  lDAPUser: string;
  lDAPPassword: string;
  aggregatorName: string;
  aggregatorId: string;
  userId: string;
  clientId: string;
  clientSecret: string;
  cifId: string;
  sFTPFolderName: string;
  sFTPUser: string;
  sFTPPassword: string;
  createdAt: Date;
  updatedAt: Date;
  upiId: string;
  __v: number;
  connectedBanking: boolean;
  enableConnectedBankingWithVA: boolean;
  accountType: string;
}

export interface ICICIAccountList {
  result: ICICIAccountResult[];
}

export interface ICICIAccountResponse {
  success: boolean;
  result: ICICIAccountResult;
}

export interface ICICIBankMerchantProfile {
  accountName?: string;
  accountPrefix?: string;
  accountNo?: string;
  accountNumber?: string;
  trusteeApprove?: boolean;
  trusteeView?: boolean;
  disableAdmin: boolean;
  isIMPS?: boolean;
  trusteeThresholdAmt?: number;
  trusteeThresholdFreq?: string;
  trusteeMail?: string;
  accountCode?: string;
  paymentMode?: string;
  payoutMode?: string;
  paymentModeAPI?: string;
  paymentModeH2H?: string;
  upiId?: string;
  ifsc?: string;
  enableConnectedBanking?: boolean;
  enableConnectedBankingWithVA?: boolean;
  escrowNumber?: string;
}

export interface ICICIBankFormElement {
  accountName?: string;
  ifsc: string;
  accountChecked: boolean;
  trusteeAccess: string;
  disableAdmin: boolean;
  isIMPS?: boolean;
  trusteeThresholdAmt?: number;
  trusteeThresholdFreq?: string;
  paymentMode?: string;
  upiId?: string;
  payoutMode?: string;
  accountPrefix?: string;
  accountNumber?: string;
  enableConnectedBanking?: boolean;
  enableConnectedBankingWithVA?: boolean;
}

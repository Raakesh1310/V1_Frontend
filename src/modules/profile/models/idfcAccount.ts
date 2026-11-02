export interface IDFCAccountResult {
  idfcMerchantId: string;
  idfcSecondId: string;
  idfcAppId: string;
  idfcAccountNo: string;
  idfcAccountName: string;
  idfcAccountCode: string;
  idfcAccountPOBOCode: string;
  idfcTrusteeMail: string;
  idfcIFSC: string;
  connectedBanking: string;
  enableConnectedBankingWithVA: boolean;
  enableHighTPS: boolean 
  idfcDescription?: string;
}

export interface IDFCAccountList {
  result: IDFCAccountResult[];
}

export interface IDFCAccountResponse {
  success: boolean;
  result: IDFCAccountResult;
}

export interface IDFCBankMerchantProfile {
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
  accountPOBOCode?: string;
  upiId?: string;
  ifsc?: string;
  enableConnectedBanking?: string;
  enableConnectedBankingWithVA?: boolean;
}

export interface IDFCBankFormElement {
  accountName?:string;
  accountChecked: boolean;
  trusteeAccess: string;
  disableAdmin: boolean;
  isIMPS?: boolean;
  trusteeThresholdAmt?: number;
  trusteeThresholdFreq?: string;
  paymentMode?: string;
  payoutMode?: string;
  upiId?: string;
  ifsc?: string;
  enabledConnectedBanking?: string;
  enableConnectedBankingWithVA?: boolean;
}

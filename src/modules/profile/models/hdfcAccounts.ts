export interface HDFCAccount {
  hdfcMerchantId: string;
  hdfcAccountNo: string;
  hdfcAccountName: string;
  hdfcAppId: string;
  hdfcSecondId: string;
  hdfcClientId: string;
  hdfcClientSecret: string;
  hdfcAccountCode: string;
  hdfcTrusteeMail: string;
  isGlobal: string;
}

export interface HDFCAccountsList {
  result: HDFCAccount[];
}

export interface HDFCAccountResponse {
  success: boolean;
  result: HDFCAccount;
}

export interface HDFCBankMerchantProfile {
  accountName?: string;
  accountNo?: string;
  trusteeApprove?: boolean;
  trusteeView?: boolean;
  disableAdmin: boolean;
  isIMPS?: boolean;
  trusteeThresholdAmt?: number;
  trusteeThresholdFreq?: string;
  trusteeMail?: string;
  accountCode?: string;
  paymentMode?: string;
}

export interface HDFCBankFormElement {
  accountName?: string;
  accountChecked: boolean;
  trusteeAccess: string;
  disableAdmin: boolean;
  isIMPS?: boolean;
  trusteeThresholdAmt?: number;
  trusteeThresholdFreq?: string;
}

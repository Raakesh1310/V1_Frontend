export interface AxisAccount {
  prefixCode?: string | undefined;
  holderName?: string | undefined;
  trusteeEmails?: any;
  axisMerchantId?: string;
  axisAccountNo?: string;
  axisAccountName?: string;
  axisAppId?: string;
  axisSecondId?: string;
  axisClientId?: string;
  axisClientSecret?: string;
  axisAccountCode?: string;
  axisTrusteeMail?: string;
  escrowNumber?: string;
  isGlobal?: boolean;
  id?: string;
  accountNo?: string;
  ifsc?: string;
  allowChildAccount?: boolean;
  connectedBanking?: boolean;
}

export interface AxisAccountsList {
  result: AxisAccount[];
}

export interface AxisAccountResponse {
  success: boolean;
  result: AxisAccount;
}

export interface AxisBankMerchantProfile {
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
  enableConnectedBanking?: boolean;
  enableConnectedBankingWithVA?: boolean;
  accountPrefix?: string;
  accountNumber?: string; 
  ifsc?: string;
  escrowNumber?: string;
}

export interface AxisBankFormElement {
  accountName?: string;
  accountChecked: boolean;
  trusteeAccess: string;
  disableAdmin: boolean;
  isIMPS?: boolean;
  trusteeThresholdAmt?: number;
  trusteeThresholdFreq?: string;
  enableConnectedBanking?: boolean;
  enableConnectedBankingWithVA?: boolean; 
  payoutMode?: string;
  accountCode?: string;
  accountNumber?: string;
  accountNo?: string;
  ifsc?: string;
}

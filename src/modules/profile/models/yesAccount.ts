export interface YesAccountResult {
  yesMerchantId: string;
  yesSecondId: string;
  yesAppId: string;
  yesAccountNo: string;
  yesAccountName: string;
  yesAccountCode: string;
  yesTrusteeMail: string;
  connectedBanking: string;
  enableConnectedBankingWithVA?: boolean;
  highTPS: boolean;
}

export interface YesAccountList {
  result: YesAccountResult[];
}

export interface YesAccountResponse {
  success: boolean;
  result: YesAccountResult;
}

export interface YesBankMerchantProfile {
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
  paymentModeAPI?: string;
  paymentModeH2H?: string;
  upiId?: string;
  escrowNumber?: string;
  ifsc?: string;
  enableConnectedBanking?: string;
  enableConnectedBankingWithVA?: boolean;
}

export interface YesBankFormElement {
  accountName?: string;
  accountChecked: boolean;
  trusteeAccess: string;
  disableAdmin: boolean;
  isIMPS?: boolean;
  trusteeThresholdAmt?: number;
  trusteeThresholdFreq?: string;
  paymentMode?: string;
  payoutMode?: string;
  upiId?: string;
  enableConnectedBanking?: string;
  enableConnectedBankingWithVA?: boolean;
}

export interface RblBank {
  _id: string;
  accountNumber: string;
  upiId: string;
  deleted: boolean;
  trusteeMail?: string;
  trusteeApprove?: boolean;
  trusteeView?: boolean;
  disableAdmin?: boolean;
  isIMPS?: boolean;
  trusteeThresholdAmt?: number;
  trusteeThresholdFreq?: string;
  paymentType?: string;
}

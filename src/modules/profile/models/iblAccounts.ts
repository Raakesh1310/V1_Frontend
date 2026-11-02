export interface IBLAccountResult {
  isGlobal: boolean;
  iblAccountNo: string;
  iblAccountName: string;
  iblTrusteeMail: string;
  iblAccountCode: string;
  iblIfscCode: string;
  iblClientCode: string;
}

export interface IBLAccountList {
  result: IBLAccountResult[];
}

export interface IBLBankMerchantProfile {
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
  upiId?: string;
  ifsc?: string;
}

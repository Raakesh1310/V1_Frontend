export interface DBSAccountResult {
  isGlobal?: boolean;
  dbsAccountNo?: string;
  dbsAccountName?: string;
  dbsTrusteeMail?: string;
  dbsPrefixCode?: string;
  dbsIFSC?: string;
  dbsClientCode?: string;
  escrowNumber?: string;
  trusteeEmails: string[];
  accountNo?: string;
  upiHostname: string;
  upiDecriptionKey: string;
  enableConnectedBankingWithVA?: boolean;
  connectedBanking?: boolean;
}

export interface DBSAccountList {
  result: DBSAccountResult[];
}

export interface DBSAccountResponse {
  success: boolean;
  result: DBSAccountResult;
}

export interface DBSBankMerchantProfile {
  accountName?: string;
  accountNo?: string;
  accountNumber?: string;
  escrowNumber?: string;
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
  upiHostname: string;
  upiDecriptionKey: string;
  enableConnectedBankingWithVA?: boolean
  enableConnectedBanking?: boolean;
  paymentMode?: string;
  payoutMode?: string;
  paymentModeAPI?: string;
  paymentModeH2H?: string;
}

export interface DBSBankFormElement {
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
  trusteeEmails?: string[];
  enableConnectedBankingWithVA?: boolean
  enableConnectedBanking?: boolean;
}

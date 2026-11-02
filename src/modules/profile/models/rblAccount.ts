export interface RBLAccountResult {
  rblTrusteeMail?: string;
  rblAccountCode?: string;
  deleted: boolean;
  _id: string;
  rblMerchantId: string;
  rblCorpId: string;
  rblMakerId: string;
  rblCheckerId: string;
  rblApproverId: string;
  rblStatusApproverId: string;
  rblStatusAccountId: string;
  rblAccountNo: string;
  rblAccountClientId: string;
  rblAccountName: string;
  rblLDAPUser: string;
  rblLDAPPassword: string;
  rblClientId: string;
  rblClientSecret: string;
  rblCifId: string;
  rblSFTPFolderName: string;
  rblSFTPUser: string;
  rblSFTPPassword: string;
  createdAt: Date;
  updatedAt: Date;
  upiId: string;
  __v: number;
  rblIFSC?: string;
  connectedBanking: boolean;
  upiHostname: string;
  upiDecriptionKey: string;
  enableConnectedBankingWithVA: boolean;
  accountType: string;
  highTPS: boolean;
  upiUserName: string;
  upiPassword: string;
  upiBCAgent: string;
  upiHMAC: string;
  upiMrchOrgId: string;
  upiAggrorgId: string;
}

export interface RBLAccountList {
  result: RBLAccountResult[];
}

export interface RBLAccountResponse {
  success: boolean;
  result: RBLAccountResult;
}

export interface RBLBankMerchantProfile {
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
  escrowNumber?: string;
  ifsc?: string;
  enableConnectedBanking?: boolean;
  upiHostname: string;
  upiDecriptionKey: string;
  enableConnectedBankingWithVA?: boolean;
}

export interface RBLBankFormElement {
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
  enableConnectedBanking?: boolean;
  enableConnectedBankingWithVA?: boolean;
}

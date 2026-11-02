export interface singleTransferApprovalModel {
  transferId: string;
  createdAt: string;
  accountId: string;
  verificationId: string;
  beneficiaryName: string;
  amount: string;
  purpose: string;
  isSelected: boolean;
  beneficiaryIFSC: string;
  createdBy: string;
  beneficiaryAccNumber: string;
  remarks: string;
  status: string;
  merchantName: string;
  accName?: string;
  bankAccountName?: string;
}

export interface bulkTransferApprovalModel {
  batchId: string;
  paymentId: string;
  accountId: string;
  createdAt: string;
  verificationId: string;
  totalAmount: string;
  isSelected: boolean;
  merchantName: string;
  numberOfTransfers: string;
  accName?: string;
  bankAccountName?: string;
}

export interface singleBulkTransferApprovalModel {
  transferId: string;
  accountId: string;
  createdAt: string;
  beneficiaryName: string;
  isSelected: boolean;
  amount: string;
  status: string;
}

export interface merchantApprovalModel {
  verificationId: string;
  merchantId: string;
  merchantName: string;
  approvalType: string;
  approvalsRequired: number;
  createdAt: string;
  level?: number;
  totalLevel: number;
  email?: string;
  approved?: boolean;
  verified?: boolean;
  verifiedAt?: string;
  isSelected?: boolean;
  active?: boolean;
  details?: string;
  type?: string;
  remarks?: string;
  isCurrent?: boolean;
}

import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Account } from '@modules/accounts/models';
import { User } from '@modules/auth/models/auth.model';
import { Transfer } from '@modules/transfers/models/transfers.model';

export interface CreateTransferResponseModel extends BaseApiResponseModel {
  result: Transfer;
}

export interface ExcelAccountFormat {
  virtualAccount?: string;
  bankAccount?: string;
  amount: number;
  beneficiaryName: string;
  beneficiaryAccNumber: string;
  beneficiaryIFSC: string;
  purpose: string;
  beneficiaryBankName: string;
  status: string;
  rowNumber: number;
  rejectionReason: string[];
  transferType?: string;
  payeeEmailId?: string;
  beneficiaryVPA: string;
  remarks?: string;
  payeeId?: string;
}

export interface ExcelApiAccountFormat {
  amount: number;
  beneficiaryName: string;
  beneficiaryAccNumber: string;
  beneficiaryIFSC: string;
  purpose: string;
  beneficiaryBankName: string;
  transferType?: string;
  payeeEmailId?: string;
  beneficiaryVPA: string;
}

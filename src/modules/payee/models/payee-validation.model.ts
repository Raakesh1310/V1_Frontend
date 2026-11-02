import { PayeeBatchStatus } from '../constants/payee-batch-status';
import { PayeeValidationStatus } from '../constants/payee-validation-status';

export interface PayeeValidationInterface {
  batchId: string;
  status: keyof typeof PayeeBatchStatus;
  merchant: string;
  merchantId: string;
  merchantTitle: string;
  createdBy: string;
  createdAt: Date | string;
  payeeAdditionCompleted: boolean;
  payeeList: IPayeeInput[];
  successfulValidations: number;
  failedValidations: number;
  processingErrorValidations: number;
}

export interface IPayeeInput {
  accountNumber: string;
  accountHolder: string;
  ifsc: string;
  bankName: string;
  bankAddress: string;
  mobile: string;
  email: string;
  status: keyof typeof PayeeValidationStatus;
  remarks: string;
}

export interface PayeeCalculatedValues {
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
}

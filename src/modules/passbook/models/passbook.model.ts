export interface Passbook {
  [key: string]: string | number;

  id: number;
  paymentId: string;
  date: string;
  description: string;
  beneficiaryName: string;
  amount: number;
  balance: number;
  status: string;
}

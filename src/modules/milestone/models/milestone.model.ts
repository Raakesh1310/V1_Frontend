export interface MilestoneModel {
  _id: string;

  milestoneId: string;
  payeeId: string;
  title: string;
  description: string;
  accountId: string;
  amount: string;
  paymentDate: Date;
}

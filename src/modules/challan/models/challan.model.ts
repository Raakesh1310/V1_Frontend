import { User } from '@modules/auth/models';
import { MerchantFields } from '@modules/auth/models/merchantFields.model';
import { TimeStamp } from '@modules/auth/models/timestamp.model';

export interface ChallanModel extends ChallanInput, MerchantFields, TimeStamp {
  account: Account;
  challanId: string;
  createdBy: User;
}

export interface ChallanInput {
  accountId: string;
  payerName: string;
  payerDetail1: string;
  payerDetail2: string;
  contact1: string;
  contact2: string;
  amount: string;
  amountWords: string;
  status: string;
}

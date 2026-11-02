import { User } from "./auth.model";
import { Merchant } from "./merchant.model";

export enum TAndCStatusEnum {
  ACCEPTED = 'accepted',
  DECLINED = 'declined'
}
export interface TAndCModel {
  merchantId: string;
  merchant: Merchant | string;
  createdBy: User | string;
  status: TAndCStatusEnum | string;
}

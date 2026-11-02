import { Merchant } from '@modules/auth/models/merchant.model';
import { MerchantUser } from '@modules/auth/models/merchantUser.model';

export interface MerchantFields {
  merchant: Merchant;
  merchantUser: MerchantUser;
  merchantUserId: string;
  merchantId: string;
}

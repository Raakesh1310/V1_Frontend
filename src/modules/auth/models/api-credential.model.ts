import { MerchantUser } from '@modules/auth/models/merchantUser.model';
import { TimeStamp } from '@modules/auth/models/timestamp.model';

export interface ApiCredential extends ApiCredentialDetail, TimeStamp {
  _id: string;
  active: boolean;
}

export interface ApiCredentialDetail extends ApiCredentialInputs {
  // user: IUser;
  merchantUser: MerchantUser;
  // merchantUserId: string;
}

export interface ApiCredentialInputs {
  apiKey: string;
  apiSecret: string;
  credentialId: string;
}

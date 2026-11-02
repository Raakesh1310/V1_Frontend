import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { User } from '@modules/auth/models';
import { Merchant } from '@modules/auth/models/merchant.model';

export interface CreateMerchantRequestInterface {
  businessName: string;
  firstName: string;
  lastName: string;
  mobile: number;
  email: string;
  emailVerified: boolean;
  relationshipManager?: string;
  useCase?: string;
}
export interface UpdateMerchantBasicDetailsInterface {
  updatedBusinessName?: string;
  updatedFirstName?: string;
  updatedLastName?: string;
  updatedMobile?: number;
  updatedEmail?: string;
}

export interface CreateMerchantResponseInterface extends BaseApiResponseModel {
  result: {
    userEntry: User;
    merchant: Merchant;
  };
}

export interface ActivateMerchantResponseInterface
  extends BaseApiResponseModel {
  result: {
    success: boolean;
  };
}

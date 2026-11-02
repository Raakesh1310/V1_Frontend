import { BaseApiResponseModel } from '@common/models/base-api-response.model';

export interface MerchantUserInterface {
  _id: string;
  roles: string[];
  active: boolean;
  status: string;
  createdBy: string;
  merchantUserId: string;
  merchant: string;
  merchantId: string;
  user: string;
  email: string;
  roleName: string;
  rolesString: string;
  createdAtString: string;
  updatedAtString: string;
}

export interface MerchantUserResponseModel extends BaseApiResponseModel {
  result: MerchantUserInterface[];
}

import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Account } from '@modules/accounts/models';
import { UploadFile } from '@modules/documents/models/doqfy.model';

export interface Deal {
  purpose: string;
  startDate: string;
  endDate: string;
  tenure: number;
  documents: UploadFile[];
  createdBy: string;
}

export interface DealData {
  propertyType: string;
  propertyAddress: string;
  state: string;
  city: string;
  pinCode: number;
  securityDeposit: number;
}

export interface DealParty {
  name: string;
  email: string;
  mobile: number;
  role: string;
  approved: boolean;
}

export const dealRoles = {
  Landlord: 'Landlord',
  Tenant: 'Tenant'
};

export interface DealDocument extends Deal {
  account: Account;
  dealData: DealData;
  dealParties: DealParty[];
  dealId: string;
  verification: Object[];
}

export interface DealResponseModel extends BaseApiResponseModel {
  result: DealDocument[];
}

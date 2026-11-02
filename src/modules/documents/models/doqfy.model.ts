import { BaseApiResponseModel } from '@common/models/base-api-response.model';

export interface UploadFile {
  name: string;
  file: File;
  documentId: string;
}

export interface Signer {
  email: string;
  signing_type: string;
  name: string;
  mobileNumber: string;
  pages: string;
  signPosition: string;
}

export interface OrderRespModel extends BaseApiResponseModel {
  result: Order;
}

export interface Order {
  documentId: string;
  orderUuid: string;
  documentUuid: string;
  fileName: string;
  signingParties: IDoqfySigner[];
  status: string;
}

interface IDoqfySigner {
  email: string;
  name: string;
  pages: string;
  signPosition: string;
}

export interface BranchResp {
  success: boolean;
  code: number;
  message: string;
  result: Branch[];
}

export interface Branch {
  branch_uuid: string;
  name: string;
  address1: string;
  address2: string;
  type: string;
  state_code: string;
  country_code: string;
}

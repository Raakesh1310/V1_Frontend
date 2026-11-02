import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import { Merchant } from '@modules/auth/models/merchant.model';
import { EscrowPageFieldWidget } from '@modules/escrow-page-widgets/models';

export interface EscrowPageRespModel extends BaseApiResponseModel {
  result: any;
}

export interface EscrowPage {
  ifsc: string;
  deleted: boolean;
  businessName: string;
  logo: string;
  accountId: string;
  title: string;
  merchant: Merchant;
  escrowPageId: string;
  url: string;
  childPages: EscrowPageChildPage[];
  tableHeaders: string[];
  bypassCustomerForm?: boolean;
  webhookURL?: string;
  redirectURL?: string;
  paymentLink?: string;
}

export interface EscrowPageChildPage {
  deleted: boolean;
  childPageId: string;
  escrowPage: string;
  escrowPageId: string;
  title: string;
  titleEditable: boolean;
  index: number;
  fields: EscrowPageFieldWidget[];
  allowedFields: string[];
}

export interface EscrowPageField {
  label: string;
  type: string;
  required: boolean;
  removable: boolean;
}

export interface EscrowPageFieldInput {
  index: number;
  fieldId: string;
}

export interface EscrowPageProductField extends EscrowPageField {
  value: string | null;
}

export interface EscrowPageCustomerField extends EscrowPageField {
  verification: boolean;
  placeholder: string;
}

export interface EscrowPageProduct
  extends EscrowPageProductField,
    EscrowPageFieldInput {}

export interface EscrowPageCustomer
  extends EscrowPageCustomerField,
    EscrowPageFieldInput {}

export interface AccountDetails {
  title: string | null;
  // ifsc: string | null;
  // accountId: string | null;
  accounts: [];
  businessName: string | null;
  logo: string | null;
}

export interface FullForm {
  accountDetail: AccountDetails;
  productDetail: EscrowPageProductField[];
  customerDetail: EscrowPageCustomerField[];
}

export interface Account {
  accountName: string;
  id: string;
  itemName: string;
  name: string;
  ifsc: string;
  bankAccount: string;
  phone: string;
  email: string;
  address1: string;
  beneId: string;
}

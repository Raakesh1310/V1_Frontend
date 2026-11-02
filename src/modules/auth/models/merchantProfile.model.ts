import { Merchant } from '@modules/auth/models/merchant.model';
import { MerchantFields } from '@modules/auth/models/merchantFields.model';
import { HDFCBankMerchantProfile } from '@modules/profile/models/hdfcAccounts';
import { IBLBankMerchantProfile } from '@modules/profile/models/iblAccounts';
import { IDFCBankMerchantProfile } from '@modules/profile/models/idfcAccount';
import { RBLBankMerchantProfile } from '@modules/profile/models/rblAccount';
import { YesBankMerchantProfile } from '@modules/profile/models/yesAccount';
import { User } from '@modules/users/models';
import { AuthorizerModel } from '../../app-common/models/authorizer.model';
import { PayeeValidationType } from '../constants/payeeValidationsType.enum';
import { ICICIBankMerchantProfile } from '@modules/profile/models/iciciAccount';
import { DBSBankMerchantProfile } from '@modules/profile/models/dbsAccounts';
import { AxisBankMerchantProfile } from '@modules/profile/models/axisAccounts';
export interface MerchantProfile extends MerchantProfileDetail {
  [index: string]: any;
  mccCode: string;
  vpaCount: number;
  upiEnabled: boolean;
  upiPayoutEnabled: boolean;
  escrowQrEnabled: boolean;
  authorizers: AuthorizerModel[];
  feeDetails: FeeDetails;
  statementFrequency: string;
  thirdPartyTransfer: boolean;
  isAccountCredited: boolean;
  isAccountAddAllowed: boolean;
  noAccAllowed: number;
  banks: BankInterface[];
  iciciBanks: ICICIBankMerchantProfile[];
  rblBanks: RBLBankMerchantProfile[];
  yesBanks: YesBankMerchantProfile[];
  idfcBanks: IDFCBankMerchantProfile[];
  hdfcBanks: HDFCBankMerchantProfile[];
  iblBanks: IBLBankMerchantProfile[];
  dbsBanks: DBSBankMerchantProfile[];
  axisBanks: AxisBankMerchantProfile[];
  promoters: merchantPromoterInterface[];
  pinePGKeys: {
    pineMerchantId: string;
    merchantAccessCode: string;
    merchantSecretKey: string;
  };
  pgSettlementAccount: string;
  mode: string;
  _id: string;
  bankVerification: boolean;
  escrowPagePG: boolean;
  enableKYC?: boolean;
  enablePayeeValidation?: boolean;
  payeeValidationType?: PayeeValidationType;
  costPerValidation?: number;
  minPercentageMatch?: number;
  enableTesting?: boolean;
  webHook: {
    webHookAuthType: string;
    transferHookURL: string;
    transferHookToken?: string;
    transferHookBasicAuthUser?: string;
    transferHookBasicAuthPass?: string;
    depositHookURL: string;
    depositHookToken?: string;
    depositHookBasicAuthUser?: string;
    depositHookBasicAuthPass?: string;
    webhookEncryptionEnabled?: boolean;
    webhookEncryptionKey?: string;
    webhookEncryptionIv?: string;
  };
  isBulkPayeeEnabled?: boolean;
  accountDocumentMandatoryForAPI: boolean;
  payeeValidationDebitAccountId: string;
  payeeValidationEmails?: string;
  xApiKey?: string;
  xApiKeyGeneratedAt?: Date;
  connectedBanking: boolean;
  sourceAccountValidation: boolean;
  enableBalanceRefresh?: boolean;
}
export interface BankInterface {
  // _id: string;
  bankName: string;
  paymentType?: string;
}

// export interface Authorizers {
//   name: string;
//   email: string;
//   mobile: string;
// }

export interface FeeDetails {
  setUpFee: number;
  virtualAccount: {
    feeSetting: string;
    feeAmount: number;
  };
  isPaymentGateway: boolean;
}

export interface MerchantProfileDetail
  extends MerchantBusiness,
    MerchantBusinessDocument,
    MerchantAddress,
    MerchantDocument,
    MerchantProfileBank {
  verified: boolean;

  /**
   * Authorised Person Details
   */
  // This is transferred to User
  // authorizedPersonName: string;
  authorizedPersonPan: string;

  /**
   * Relation
   */
  user: User;
  merchant: Merchant;
  merchantId: string;
  docs: [];
  firstName: string;
  lastName: string;
  email: string;
  mobile: number;
}

export interface merchantPromoterInterface
  extends updateMerchantPromoterInterface {
  firstName: string;
  lastName: string;
  email?: string;
  mobile?: string;
  authorizedPersonPan: string;
  aadhar: string;
  promoterDetailsVerifiedAt?: string;
  __update_promoterDetailsVerifiedAt?: string;
  __update_firstName?: string;
  __update_lastName?: string;
  __update_mobile?: string;
  __update_email?: string;
  __update_authorizedPersonPan?: string;
  __update_aadhar?: string;
}

export interface MerchantProfileBank {
  bankAccountVerified: boolean;
  accountNo: string;
  bankName: string;
  ifsc: string;
  bankBranch: string;
  bankVerifiedAt: string;
}

export interface MerchantProfileInputDTO
  extends MerchantBusiness,
    MerchantFields,
    MerchantAddress,
    MerchantDocument {
  /**
   * Authorised Person Details
   */
  // authorizedPersonName: string;
  authorizedPersonPan: string;

  /**
   * Relation
   */
  user: User;
  merchant: Merchant;
}

/**
 * Business Basic Details
 */
export interface MerchantBusiness {
  businessVerified: boolean;
  businessName: string;
  businessType: string;
  businessGst: string;
  businessPan: string;
  businessVerifiedAt: string;
}

/**
 * Business Documents Details
 */
export interface MerchantBusinessDocument {
  /* New properties */
  businessGst: string;
  docBusinessGst: string;
  docBusinessGstOriginal: string;
  docBusinessGstVerified: boolean;

  businessPan: string;
  docBusinessPan: string;
  docBusinessPanOriginal: string;
  docBusinessPanVerified: boolean;

  docCancelledCheque: string;
  docCancelledChequeOriginal: string;
  docCancelledChequeVerified: boolean;

  docBusinessLogo: string;
  docBusinessLogoOriginal: string;
  docBusinessLogoVerified: boolean;

  docAuthorizedPersonPan: string;
  docAuthorizedPersonPanOriginal: string;
  docAuthorizedPersonPanVerified: boolean;

  docCOI: string;
  docCOIOriginal: string;
  docCOIVerified: boolean;

  docCA: string;
  docCAOriginal: string;
  docCAVerified: boolean;
}

/**
 * Business Documents Details
 */
export interface MerchantDocument {
  authorizedPersonPan: string;
  authorizedPersonPanVerified: boolean;
}

/**
 * Business Address Details
 */
export interface MerchantAddress {
  addressLine: string;
  pinCode: string;
  city: string;
  state: string;
  country: string;
}

export interface updateMerchantPromoterInterface {
  updateFirstName?: string;
  updateLastName?: string;
  updateAuthorizedPersonPan?: string;
  updateAadhar?: string;
  updatePromoterDetailsVerifiedAt?: string;
}

export interface UpdateMerchantBusinessProfile {
  updateBusinessName?: string;
  updateBusinessType?: string;
  updateBusinessGst?: string;
  updateBusinessPan?: string;
  updateAddressLine?: string;
  updatePinCode?: string;
  updateCity?: string;
  updateState?: string;
  updateCountry?: string;
  updateAccountNo?: string;
  updateBankName?: string;
  updateIfsc?: string;
  updateBankBranch?: string;
  updatePromoters?: updateMerchantPromoterInterface;
}

export interface UpdateParty extends UpdateMerchantBusinessProfile {}

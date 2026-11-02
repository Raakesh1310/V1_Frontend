import { User } from '@modules/auth/models';

export interface UserProfile extends UserProfileBank, UserProfileDocs {
  _id: string;
  businessVerified: boolean;
  businessName: string;
  businessType: string;
  addressLine: string;
  pinCode: string;
  city: string;
  state: string;
  authorizedPersonPanVerified: boolean;
  authorizedPersonPan: string;
  businessPan: string;
  businessGst: string;
  user: User;
  promoters? : promotersStruct[];
}

export interface promotersStruct {
  aadhar: string;
  authorizedPersonPan: string;
  lastName: string;
  firstName: string;
}


export interface UserProfileBank {
  // bankAccountVerified:boolean;
  accountNo: string;
  bankName: string;
  ifsc: string;
}

export interface UserProfileDocs {
  docAuthorizedPersonPan: string;
  docAuthorizedPersonPanOriginal: string;
  docAuthorizedPersonPanVerified: boolean;

  docBusinessPan: string;
  docBusinessPanOriginal: string;
  docBusinessPanVerified: boolean;

  docCancelledCheque: string;
  docCancelledChequeOriginal: string;
  docCancelledChequeVerified: boolean;

  docBusinessLogo: string;
  docBusinessLogoOriginal: string;
  docBusinessLogoVerified: boolean;

  docBusinessGst: string;
  docBusinessGstOriginal: string;
  docBusinessGstVerified: boolean;
}

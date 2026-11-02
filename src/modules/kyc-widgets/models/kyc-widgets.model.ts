export interface options {
  value : number,
  text : string,
  isSelected : boolean,
}

export interface kycOptions {
  text : string,
  isSelected : boolean,
}

export interface promoterDetails {
  name : string,
  din : string,
  pan : string,
  aadhar : string,
  aadharFrontUploaded: boolean,
  aadharBackUploaded: boolean,
  panUploaded: boolean,
  panVerifiedAt: string,
  panFront: string,
  aadharVerifiedAt?: string,
  panImageName: string,
  aadharFrontImageName: string,
  aadharFront: string,
  aadharBackImageName: string,
  aadharBack: string,
  aadhaarVerified?: boolean,
  designation?:string,
  panDocId?: string,
  aadharFrontDocId?: string,
  aadharBackDocId?: string,
  email?: string,
  edit?: boolean,
  panLoading?: boolean,
  aadhaarLoading?: boolean
}


export interface KycDocuments {
  hash: string,
  name: string,
  type: string,
  documentId: string,
}

export interface kycDataModel {
  sendKycToName: string;
  sendKycToEmail: string;
  mobile: number;
  mobileVerified: boolean;
  crnId: string;
  name: string;
  email: string;
  businessName: string;
  status: string;
  kycLink: string;
  importExport: boolean;
  annualRevenue: number;
  businessPan: string;
  industryType: string;
  businessPanVerified: boolean;
  businessPanVerifiedAt: string;
  gstin: string;
  gstAvailable: boolean;
  gstVerified: boolean;
  gstVerifiedAt: string;
  cin: string;
  cinVerified: boolean;
  cinVerifiedAt: string;
  cinAddress: string;
  address: string;
  businessType: string;
  dateOfRegistration: string;
  bankAccNumber: number;
  ifsc: string;
  bankName: string;
  bankBranch: string;
  bankVerified: boolean;
  bankVerifiedAt: string;
  promoters: promoterDetails[];
  documents: KycDocuments[];
  page?: string;
  companyStatus: string;
  natureOfBusiness: [];
  latitude: string;
  longitude: string;
  digioTokenId: string;
  digioRequestId: string;
  digioTokenTimeStamp: number;
  accountHolderName: string;
}

export enum statuses {
  SENT = "SENT" ,
  InProgress = "In Progress",
  Completed = "Completed"
}


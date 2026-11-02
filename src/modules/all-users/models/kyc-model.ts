export interface KycLinkInterface {
  crnId: string;
  name: string;
  email: string;
  sendKycToName: string;
  sendKycToEmail: string;
  companyStatus: string;
  mobile: number;
  mobileVerified: boolean;
  businessName: string;
  page: string;
  status: string;
  kycLink: string;
  importExport: boolean;
  annualRevenue: number;
  businessPan: string;
  businessPanVerified: boolean;
  businessPanVerifiedAt: string;
  latitude: string;
  longitude: string;
  gstin: string;
  gstVerified: boolean;
  gstVerifiedAt: string;
  cin: string;
  cinVerified: boolean;
  cinVerifiedAt: string;
  address: string;
  businessType: string;
  industryType: string;
  dateOfRegistration: string;
  bankAccNumber: string;
  ifsc: string;
  bankName: string;
  bankBranch: string;
  bankVerified: boolean;
  bankVerifiedAt: string;
  natureOfBusiness: [];
  promoters: [
    {
      name: string;
      designation: string;
      din: string;
      pan: string;
      panVerified: boolean;
      panVerifiedAt: string;
      panFront: string;
      panFrontName: string;
      aadhaarNo: string;
      // aadhaarVerified: boolean;
      // aadhaarVerifiedAt: string;
      aadhaarFront: string;
      aadhaarFrontName: string;
      aadhaarBack: string;
      aadhaarBackName: string;
    }
  ];
}

export interface KycSubmitInterface {
  name: string;
  email: string;
  businessType: string;
}
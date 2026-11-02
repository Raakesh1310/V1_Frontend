export default interface Party {
  merchant?: string;
  merchantId: string;
  businessName: string;
  businessType: string;
  businessGst: string;
  businessPan: string;
  addressLine: string;
  pinCode: string;
  city: string;
  state: string;
  accountNo: string;
  bankName: string;
  ifsc: string;
  bankBranch: string;
  promoters: [
    {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      mobile: string;
      authorizedPersonPan: string;
      aadhar: string;
    }
  ];
  partyId: string;
  createdAt: string;
  updatedAt: string;
}

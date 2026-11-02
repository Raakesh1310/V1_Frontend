import { TAndCModel } from "./tAndC.model";

export interface User {
  isSuperAdmin: boolean;
  captchaToken: string;
  otp: string;
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  mobile: string;
  email: string;
  role: string;
  image: string;
  token: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  authorizedPerson: string;
  businessGst: string;
  businessPAN: string;
  address: string;
  pinCode: string;
  gAuthEnabled: boolean;
  gAuthSecret: string;
  totp: string;
  whatsapp: boolean;
  nonce?: string;
  tAndC?: TAndCModel;
}

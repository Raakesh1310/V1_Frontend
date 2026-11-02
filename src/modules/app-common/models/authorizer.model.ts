export interface AuthorizerModel {
  authorizerId?: string;
  name: string;
  email: string;
  mobile: string;
  level?: number;
  approvalsRequired: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  action?: string;
  _id?: string;
  deleted?: boolean;
  access?: string;
  bank?: string;
}

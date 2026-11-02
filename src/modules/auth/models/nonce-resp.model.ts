export interface NonceResponseModel {
  result: NonceModel;
  success: boolean;
}

export interface NonceModel {
  key: string;
}
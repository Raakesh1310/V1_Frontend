export interface RazorpayResponseModel {
  id: string;
  amount: number;
  status: string;
  currency: string;
  receipt: string;
}

export interface RazorpayOrderResponseModel {
  id: string;
  receipt: string;
}

export default interface DashboardFiguresInterface {
  numInwardTransactions: number;
  totalAmountInwardTransactions: number;
  averageDailyAmountInwardTransactions: number;

  numOutwardTransfers: number;
  totalAmountOutwardTransfer: number;
  averageDailyAmountOutwardTransfer: number;

  numMerchants: number;
  totalAmountMerchantBilling: number;
  averageDailyAmountMerchant: number;
}

import { Moment } from 'moment';

export interface DashboardData {
  totalNumTransactions: number;
  totalNumTransfers: number;
  totalTransferAmount: number;
  totalTransactionAmount: number;
  totalAvailableBalance: number;
  averageMonthlyTransactions: [];
  averageMonthlyTransfers: [];
  dayWiseTransaction: DayWiseStruct[];
  dayWiseTransfer: DayWiseStruct[];
  totalBlockedFund: number;
  totalNumberOfActiveMerchants: number;
  merchantInDateRange: number;
  totalBilledAmount: number;
  billedDetailsMonthWise: [];
  dayWiseBills: DayWiseStruct[];
  averageDailyBalance: number;
}

export interface DashTopData {
  totalEscrowAccounts: EscrowAccounts[];
  totalNumOfPendingTransfers: number;
  totalPendingTransferAmount: number;
  totalEscrowBalance: number;
}

export interface Dates {
  startDate: Moment;
  endDate: Moment;
}

export interface EscrowAccounts {
  accountName: string;
  accountBalance: number;
}

export interface DayWiseStruct {
  id: DateObj;
  amount: number;
  monthName: string;
  count: number;
}

export interface DateObj {
  month: number;
  day: number;
  year: number;
}

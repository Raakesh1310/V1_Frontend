export default interface DashboardFiltersInterface {
  bankNames?: string[];
  statuses?: string[];
  startDate?: Date;
  endDate?: Date;
  verified: true;
  status?: string;
  connectedBanking: boolean;
}

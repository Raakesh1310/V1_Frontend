import DashboardFiguresInterface from './dashboard-figures.interface';
import { DashboardReportDataInterface } from './dashboard-report-data.interface';

export default interface FetchDashboardFiguresInterface {
  type:
    | keyof DashboardFiguresInterface
    | 'transactionReport'
    | 'transferReport';
  value: number | DashboardReportDataInterface;
}

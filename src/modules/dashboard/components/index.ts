import { DashboardCardDetailsComponent } from './dashboard-card-details/dashboard-card-details.component';
import { DashboardCardsComponent } from './dashboard-cards/dashboard-cards.component';
import { DashboardChartsComponent } from './dashboard-charts/dashboard-charts.component';
import { DashboardMultiCardComponent } from './dashboard-multi-card/dashboard-multi-card.component';
import { DashboardMultiImageCardsComponent } from './dashboard-multi-image-cards/dashboard-multi-image-cards.component';
import { DashboardProjectsOverviewComponent } from './dashboard-projects-overview/dashboard-projects-overview.component';
import { DashboardTablesComponent } from './dashboard-tables/dashboard-tables.component';
import { TotalActiveAccountComponent } from './total-active-account-card/total-active-account.component';

export const components = [
  DashboardCardsComponent,
  DashboardChartsComponent,
  DashboardTablesComponent,
  DashboardMultiCardComponent,
  DashboardProjectsOverviewComponent,
  DashboardMultiImageCardsComponent,
  DashboardCardDetailsComponent,
  TotalActiveAccountComponent
];

export * from './dashboard-cards/dashboard-cards.component';
export * from './dashboard-charts/dashboard-charts.component';
export * from './dashboard-tables/dashboard-tables.component';
export * from './dashboard-multi-card/dashboard-multi-card.component';
export * from './dashboard-projects-overview/dashboard-projects-overview.component';
export * from './dashboard-multi-image-cards/dashboard-multi-image-cards.component';
export * from './dashboard-card-details/dashboard-card-details.component';
export * from './total-active-account-card/total-active-account.component';
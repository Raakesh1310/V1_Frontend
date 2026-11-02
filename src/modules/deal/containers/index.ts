import { AllDealsPageComponent } from './all-deals-page/all-deals-page.component';
import { DealDetailAdminPageComponent } from './deal-detail-admin-page/deal-detail-admin-page.component';
import { DealDetailPageComponent } from './deal-detail-page/deal-detail-page.component';
import { DealFormPageComponent } from './deal-form-page/deal-form-page.component';
import { DealListPageComponent } from './deal-list-page/deal-list-page.component';
import { DealPageComponent } from './deal-page/deal-page.component';

export const containers = [
  DealPageComponent,
  DealFormPageComponent,
  DealListPageComponent,
  DealDetailPageComponent,
  AllDealsPageComponent,
  DealDetailAdminPageComponent
];

export * from './deal-page/deal-page.component';
export * from './deal-form-page/deal-form-page.component';
export * from './deal-list-page/deal-list-page.component';
export * from './deal-detail-page/deal-detail-page.component';
export * from './all-deals-page/all-deals-page.component';
export * from './deal-detail-admin-page/deal-detail-admin-page.component';

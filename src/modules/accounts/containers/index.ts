import { AccountDetailAdminPageComponent } from './account-detail-admin-page/account-detail-admin-page.component';
import { AccountDetailsPageComponent } from './account-details-page/account-details-page.component';
import { AccountOverviewPageComponent } from './account-overview-page/account-overview-page.component';
import { AccountPageComponent } from './account-page/account-page.component';
import { AccountsFormPageComponent } from './accounts-form-page/accounts-form-page.component';
import { AllAccountsPageComponent } from './all-accounts-page/all-accounts-page.component';

export const containers = [
  AccountDetailAdminPageComponent,
  AccountPageComponent,
  AccountOverviewPageComponent,
  AccountsFormPageComponent,
  AllAccountsPageComponent,
  AccountDetailsPageComponent
];

export * from './account-page/account-page.component';
export * from './account-overview-page/account-overview-page.component';
export * from './accounts-form-page/accounts-form-page.component';
export * from './all-accounts-page/all-accounts-page.component';
export * from './account-details-page/account-details-page.component';
export * from './account-detail-admin-page/account-detail-admin-page.component';

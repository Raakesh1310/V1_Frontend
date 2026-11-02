import { PassbookOverviewComponent } from './passbook-overview/passbook-overview.component';
import { PassbookComponent } from './passbook/passbook.component';
import { TransferDetailsPageComponent } from './transfer-details-page/transfer-details-page.component';
import { BulkTransferDetailsPageComponent } from './bulk-transfer-details-page/bulk-transfer-details-page.component';
import { PassbookOverviewBankAccountsComponent } from './passbook-overview-bank-accounts/passbook-overview-bank-accounts.component';

export const containers = [
  PassbookComponent,
  PassbookOverviewComponent,
  PassbookOverviewBankAccountsComponent,
  TransferDetailsPageComponent,
  BulkTransferDetailsPageComponent
];

export * from './passbook/passbook.component';
export * from './passbook-overview/passbook-overview.component';
export * from './transfer-details-page/transfer-details-page.component';
export * from './bulk-transfer-details-page/bulk-transfer-details-page.component';
export * from './passbook-overview-bank-accounts/passbook-overview-bank-accounts.component';

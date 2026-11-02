import { AllDepositsComponent } from './bank-account-all-deposits/bank-account-all-deposits.component';
import { BankAccountBgComponent } from './bank-account-bg/bank-account-bg/bank-account-bg.component';
import { BankAccountPageComponent } from './bank-account-page/bank-account-page.component';
import { StatementPageComponent } from './statement-page/statement-page.component';

export const containers = [
  BankAccountBgComponent,
  BankAccountPageComponent,
  StatementPageComponent,
  AllDepositsComponent
];

export * from './bank-account-page/bank-account-page.component';
export * from './bank-account-bg/bank-account-bg/bank-account-bg.component';
export * from './statement-page/statement-page.component';
export * from './bank-account-all-deposits/bank-account-all-deposits.component';

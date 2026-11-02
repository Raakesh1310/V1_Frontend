import { BankAccountComponent } from './bank-account-detail/bank-account.component';
import { BankAccountStatementComponent } from './bank-account-statement/bank-account-statement.component';
import { DepositListComponent } from './bank-account-deposit-list/bank-account-deposit-list.component';
import { ConnectedBankingAgreementComponent } from './connected-banking-agreement/connected-banking-agreement.component';
import { DigitalEscrowListComponent } from './digital-escrow-list/digital-escrow-list.component';

export const components = [
  BankAccountComponent,
  BankAccountStatementComponent,
  DepositListComponent,
  DigitalEscrowListComponent,
  ConnectedBankingAgreementComponent
];

export * from './bank-account-detail/bank-account.component';
export * from './bank-account-statement/bank-account-statement.component';
export * from './bank-account-deposit-list/bank-account-deposit-list.component';
export * from './connected-banking-agreement/connected-banking-agreement.component';
export * from './digital-escrow-list/digital-escrow-list.component';

import { AllTransactionsComponent } from './all-transactions/all-transactions.component';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { TransactionTableDefaultComponent } from './transaction-table-default/transaction-table-default.component';
import { TransactionTableListComponent } from './transaction-table-list/transaction-table-list.component';

export const components = [
  TransactionTableListComponent,
  TransactionTableDefaultComponent,
  AllTransactionsComponent,
  TransactionDetailsComponent
];

export * from './transaction-table-list/transaction-table-list.component';
export * from './transaction-table-default/transaction-table-default.component';
export * from './all-transactions/all-transactions.component';
export * from './transaction-details/transaction-details.component';

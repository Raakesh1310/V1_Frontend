import { AccountsGuard } from './accounts.guard';
import { Account_form_guard } from '@modules/accounts/guards/account_form_guard';

export const guards = [AccountsGuard, Account_form_guard];

export * from './accounts.guard';
export * from './account_form_guard';

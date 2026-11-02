import { AccountDocumentService } from './account-document.service';
import { AccountPayeeService } from './account-payee.service';
import { AccountsService } from './accounts.service';
import { AccountsAdminService } from './accountsAdmin.service';

export const services = [
  AccountsService,
  AccountsAdminService,
  AccountPayeeService,
  AccountDocumentService
];

export * from './accounts.service';
export * from './accountsAdmin.service';
export * from './account-payee.service';
export * from './account-document.service';

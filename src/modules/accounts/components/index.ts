import { AccountDescriptionFormComponent } from './account-description-form/account-description-form.component';
import { AccountDetailComponent } from './account-detail/account-detail.component';
import { AccountDetailsComponent } from './account-details (to be deleted)/account-details.component';
import { AccountDocumentFormComponent } from './account-document-form/account-document-form.component';
import { AccountDocumentsComponent } from './account-documents/account-documents.component';
import { AccountFdDetailComponent } from './account-fd-detail/account-fd-detail.component';
import { AccountPayeeDetailComponent } from './account-payee-detail/account-payee-detail.component';
import { AccountPayeeFormComponent } from './account-payee-form/account-payee-form.component';
import { AccountsTableDefaultComponent } from './accounts-table-default/accounts-table-default.component';
import { AllAccountsComponent } from './all-accounts/all-accounts.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { AccountsPaymentComponent } from './accounts-payment/accounts-payment.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { AccountDepositComponent } from './account-deposit/account-deposit.component';
import { TwoDigitDecimalNumberDirective } from './account-deposit/twoDigitDecimalNumber';
import { AccountFeeDetailsComponent } from './account-fee-details/account-fee-details.component';
import { AccountSourceValidationComponent } from './account-source-validation/account-source-validation.component';

export const components = [
  AccountsTableDefaultComponent,
  CreateAccountComponent,
  AllAccountsComponent,
  AccountDetailsComponent,
  AccountDocumentsComponent,
  AccountDetailComponent,
  AccountPayeeDetailComponent,
  AccountFdDetailComponent,
  AccountDescriptionFormComponent,
  AccountPayeeFormComponent,
  AccountDocumentFormComponent,
  AccountsPaymentComponent,
  AccountSettingsComponent,
  AccountDepositComponent,
  TwoDigitDecimalNumberDirective,
  AccountFeeDetailsComponent,
  AccountSourceValidationComponent
];

export * from './accounts-table-default/accounts-table-default.component';
export * from './create-account/create-account.component';
export * from './all-accounts/all-accounts.component';
export * from './account-details (to be deleted)/account-details.component';
export * from './account-documents/account-documents.component';
export * from './account-detail/account-detail.component';
export * from './account-payee-detail/account-payee-detail.component';
export * from './account-fd-detail/account-fd-detail.component';
export * from './account-description-form/account-description-form.component';
export * from './account-payee-form/account-payee-form.component';
export * from './account-document-form/account-document-form.component';
export * from './accounts-payment/accounts-payment.component';
export * from './account-settings/account-settings.component';
export * from './account-deposit/account-deposit.component';
export * from './account-deposit/twoDigitDecimalNumber';
export * from './account-fee-details/account-fee-details.component';
export * from './account-source-validation/account-source-validation.component'

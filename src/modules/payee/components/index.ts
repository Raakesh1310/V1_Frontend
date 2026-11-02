import { AddPayeeComponent } from './add-payee/add-payee.component';
import { AlertPayeeCreationComponent } from './alert-payee-creation/alert-payee-creation.component';
import { PayeeBasicDetailComponent } from './payee-basic-detail/payee-basic-detail.component';
import { PayeeListComponent } from './payee-list/payee-list.component';
import { MultiplePayeesComponent } from '@modules/payee/components/multiple-payees/multiple-payees.component';
import { PayeeValidationComponent } from './payee-validation/payee-validation.component';

export const components = [AddPayeeComponent, AlertPayeeCreationComponent, PayeeListComponent, PayeeBasicDetailComponent, MultiplePayeesComponent, PayeeValidationComponent];

export * from './add-payee/add-payee.component';
export * from './alert-payee-creation/alert-payee-creation.component';
export * from './payee-list/payee-list.component';
export * from './payee-basic-detail/payee-basic-detail.component';
export * from './multiple-payees/multiple-payees.component';
export * from './payee-validation/payee-validation.component';

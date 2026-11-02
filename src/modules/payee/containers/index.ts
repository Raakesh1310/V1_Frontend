import { AddPayeeComponent } from './add-payee/add-payee.component';
import { PayeeDetailComponent } from './payee-detail/payee-detail.component';
import { PayeeListComponent } from './payee-list/payee-list.component';
import { PayeeValidationContainer } from './payee-validation/payee-validation.component';

export const containers = [AddPayeeComponent, PayeeListComponent, PayeeDetailComponent, PayeeValidationContainer];

export * from './add-payee/add-payee.component';
export * from './payee-list/payee-list.component';
export * from './payee-detail/payee-detail.component';
export * from './payee-validation/payee-validation.component';

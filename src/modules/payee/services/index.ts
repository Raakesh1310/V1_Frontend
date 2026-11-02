import { DecimalPipe } from '@angular/common';
import { PayeeValidationService } from './payee-validation.service';
import { PayeeService } from './payee.service';

export const services = [PayeeService, PayeeValidationService, DecimalPipe];

export * from './payee.service';

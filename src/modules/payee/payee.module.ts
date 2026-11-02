/* tslint:disable: ordered-imports*/
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as payeeComponents from './components';

/* Containers */
import * as payeeContainers from './containers';

/* Guards */
import * as payeeGuards from './guards';

/* Services */
import * as payeeServices from './services';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { MultiplePayeesComponent } from './components/multiple-payees/multiple-payees.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import * as profileServices from '@modules/profile/services';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule,
    NgxSpinnerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    ...payeeServices.services,
    ...profileServices.services,
    ...payeeGuards.guards,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [...payeeContainers.containers, ...payeeComponents.components, MultiplePayeesComponent],
  exports: [...payeeContainers.containers, ...payeeComponents.components]
})
export class PayeeModule {}

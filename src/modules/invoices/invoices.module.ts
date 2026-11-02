/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as invoicesComponents from './components';
import * as merchantComponents from '@modules/merchant/components';

/* Containers */
import * as invoicesContainers from './containers';

/* Guards */
import * as invoicesGuards from './guards';

/* Services */
import * as invoicesServices from './services';
import * as merchantServices from '@modules/merchant/services';
import * as profileService from '@modules/profile/services';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { NgxPrintModule } from 'ngx-print';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule,
    NgMultiSelectDropDownModule,
    NgxPrintModule
  ],
  providers: [
    ...profileService.services,
    ...merchantServices.services,
    ...invoicesServices.services,
    ...invoicesGuards.guards,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    merchantComponents.MerchantBillingDetailComponent,
    ...invoicesContainers.containers,
    ...invoicesComponents.components
  ],
  exports: [...invoicesContainers.containers, ...invoicesComponents.components]
})
export class InvoicesModule {}

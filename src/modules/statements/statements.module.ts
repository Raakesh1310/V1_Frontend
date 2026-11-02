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
import * as statementsComponents from './components';

/* Containers */
import * as statementsContainers from './containers';

/* Guards */
import * as statementsGuards from './guards';

/* Services */
import * as statementsServices from './services';
import { TokenInterceptor } from '@common/services/token.interceptor';
import  * as bankAccountService  from '@modules/bank-account/services';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule
  ],
  providers: [
    ...statementsServices.services,
    ...statementsGuards.guards,
    ...bankAccountService.services,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    ...statementsContainers.containers,
    ...statementsComponents.components
  ],
  exports: [
    ...statementsContainers.containers,
    ...statementsComponents.components
  ]
})
export class StatementsModule {}

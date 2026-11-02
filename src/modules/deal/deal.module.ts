/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as dealComponents from './components';

/* Containers */
import * as dealContainers from './containers';

/* Guards */
import * as dealGuards from './guards';
import * as accountsServices from '../accounts/services';

/* Services */
import * as dealServices from './services';
import { TokenInterceptor } from '@common/services/token.interceptor';

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
    DecimalPipe,
    ...dealServices.services,
    ...dealGuards.guards,
    ...accountsServices.services,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [...dealContainers.containers, ...dealComponents.components],
  exports: [...dealContainers.containers, ...dealComponents.components]
})
export class DealModule {}

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
import * as vpaComponents from './components';

/* Containers */
import * as vpaContainers from './containers';

/* Guards */
import * as vpaGuards from './guards';

/* Services */
import * as vpaServices from './services';
import * as accountService from '../accounts/services'
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
    ...vpaServices.services,
    ...vpaGuards.guards,
    ...accountService.services,
    DecimalPipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [...vpaContainers.containers, ...vpaComponents.components],
  exports: [...vpaContainers.containers, ...vpaComponents.components]
})
export class VpaModule {}

/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { NgxPrintModule } from 'ngx-print';

/* Components */
import * as helpdeskComponents from './components';

/* Containers */
import * as helpdeskContainers from './containers';

/*Directives */
import * as helpdeskDirective from './directives';

/* Guards */
import * as helpdeskGuards from './guards';

/* Services */
import * as helpdeskServices from './services';
import { AccountsService } from '@modules/accounts/services';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { HelpdeskFormComponent } from './components/helpdesk-form/helpdesk-form.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule,
    NgxPrintModule
  ],
  providers: [
    AccountsService,
    DecimalPipe,
    ...helpdeskServices.services,
    ...helpdeskGuards.guards,
    ...helpdeskDirective.directives,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    ...helpdeskContainers.containers,
    ...helpdeskComponents.components,
    ...helpdeskDirective.directives,
    HelpdeskFormComponent
  ],
  exports: [...helpdeskContainers.containers, ...helpdeskComponents.components]
})
export class helpdeskModule {}

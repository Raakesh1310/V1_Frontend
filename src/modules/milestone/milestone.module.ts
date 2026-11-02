/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as milestonesComponents from './components';

/* Containers */
import * as milestonesContainers from './containers';

/* Guards */
import * as milestonesGuards from './guards';

/* Services */
import * as milestonesServices from './services';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { AccountsService } from '@modules/accounts/services';
import { PayeeService } from '@modules/payee/services';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule,
    NgSelectModule
  ],
  providers: [
    AccountsService,
    PayeeService,
    DecimalPipe,
    ...milestonesServices.services,
    ...milestonesGuards.guards,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    ...milestonesContainers.containers,
    ...milestonesComponents.components
  ],
  exports: [
    ...milestonesContainers.containers,
    ...milestonesComponents.components
  ]
})
export class MilestoneModule {}

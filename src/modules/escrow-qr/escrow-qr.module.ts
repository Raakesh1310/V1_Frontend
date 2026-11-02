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
import * as escrowQrComponents from './components';

/* Containers */
import * as escrowQrContainers from './containers';

/* Guards */
import * as escrowQrGuards from './guards';

/* Services */
import * as escrowQrServices from './services';
import { TokenInterceptor } from '@common/services/token.interceptor';

import * as accountsServices from '../accounts/services'
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule,
    NgSelectModule,
    NgxSpinnerModule
  ],
  providers: [
    ...accountsServices.services,
    ...escrowQrServices.services,
    ...escrowQrGuards.guards,
    DecimalPipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    ...escrowQrContainers.containers,
    ...escrowQrComponents.components
  ],
  exports: [...escrowQrContainers.containers, ...escrowQrComponents.components]
})
export class EscrowQrModule {}

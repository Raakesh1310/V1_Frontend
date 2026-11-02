import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import * as bankAccountContainers from './containers';
import * as bankAccountComponents from './components';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { AppCommonModule } from '@common/app-common.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from 'ngx-spinner';
import * as bankAccountService from './services';
import * as accountsServices from '../accounts/services';
import * as partyServices from '../parties/services';
import { BankAccountBasicDetailsComponent } from './components/bank-account-basic-details/bank-account-basic-details.component';
import { BankAccountEscrowPartiesComponent } from './components/bank-account-escrow-parties/bank-account-escrow-parties.component';
import { AccountsModule } from '@modules/accounts/accounts.module';

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
    NgxSpinnerModule,
    AccountsModule
  ],
  providers: [
    DecimalPipe,
    ...bankAccountService.services,
    ...accountsServices.services,
    ...partyServices.services,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    ...bankAccountContainers.containers,
    ...bankAccountComponents.components,
    BankAccountBasicDetailsComponent,
    BankAccountEscrowPartiesComponent,
  ],
  exports: [
    ...bankAccountContainers.containers,
    ...bankAccountComponents.components
  ]
})
export class BankAccountModule { }

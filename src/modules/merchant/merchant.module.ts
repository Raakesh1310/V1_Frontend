/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { InvoicesModule } from '@modules/invoices/invoices.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

/* Components */
import * as merchantComponents from './components';

/* Containers */
import * as merchantContainers from './containers';

/* Guards */
import * as merchantGuards from './guards';

/* Services */
import * as merchantServices from './services';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { AccountsModule } from '@modules/accounts/accounts.module';
import { PayeeModule } from '@modules/payee/payee.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BankAccountModule } from '@modules/bank-account/bank-account.module';
import { PartiesModule } from '@modules/parties/parties.module';
import { ApprovalsModule } from '@modules/approvals/approvals.module';
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
    ProfileModule,
    AccountsModule,
    PayeeModule,
    ProfileModule,
    InvoicesModule,
    DragDropModule,
    NgxSpinnerModule,
    BankAccountModule,
    PartiesModule,
    ApprovalsModule,
    NgSelectModule
  ],
  providers: [
    ...merchantServices.services,
    ...merchantGuards.guards,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    ...merchantContainers.containers,
    ...merchantComponents.components
  ],
  exports: [...merchantContainers.containers, ...merchantComponents.components]
})
export class MerchantModule {}

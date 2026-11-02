/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { TransfersService } from '@modules/transfers/services';
import { NgxPrintModule } from 'ngx-print';

/* Components */
import * as passbookComponents from './components';

/* Containers */
import * as passbookContainers from './containers';

/*Directives */
import * as passbookDirective from './directives';

/* Guards */
import * as passbookGuards from './guards';

/* Services */
import * as passbookServices from './services';
import { AccountsService } from '@modules/accounts/services';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { BulkTableListComponent } from './components/bulk-table-list/bulk-table-list.component';
import { BulkTransferDetailsComponent } from './components/bulk-transfer-details/bulk-transfer-details.component';
import { BulkTransferDetailsPageComponent } from './containers/bulk-transfer-details-page/bulk-transfer-details-page.component';
import { ScheduledTransferComponent } from '@modules/transfers/components/scheduled-transfer/scheduled-transfer.component'
import * as profileServices from '@modules/profile/services';
import { PassbookOverviewBankAccountsComponent } from './containers/passbook-overview-bank-accounts/passbook-overview-bank-accounts.component';

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
    TransfersService,
    DecimalPipe,
    ...passbookServices.services,
    ...profileServices.services,
    ...passbookGuards.guards,
    ...passbookDirective.directives,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    ...passbookContainers.containers,
    ...passbookComponents.components,
    ...passbookDirective.directives,
    BulkTableListComponent,
    BulkTransferDetailsComponent,
    BulkTransferDetailsPageComponent,
    ScheduledTransferComponent,
    PassbookOverviewBankAccountsComponent
  ],
  exports: [...passbookContainers.containers, ...passbookComponents.components]
})
export class PassbookModule {}

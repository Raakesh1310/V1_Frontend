/* tslint:disable: ordered-imports*/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { NgSelectModule } from '@ng-select/ng-select';

/* Components */
import * as transfersComponents from './components';

/* Containers */
import * as transfersContainers from './containers';

/* Guards */
import * as transfersGuards from './guards';

/* Services */
import * as transfersServices from './services';
import * as accountsServices from '../accounts/services';
import * as passbookServices from '../passbook/services';
import * as payeeServices from '../payee/services';
import * as VpaServices from '../vpa/services';
// import { ScheduledTransferComponent } from '@modules/transfers/components';
import { ProfileModule } from '@modules/profile/profile.module';
import { PassbookModule } from '@modules/passbook/passbook.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { BulkTransferOverviewComponent } from './containers/bulk-transfer-overview/bulk-transfer-overview.component';
import { BulkTransferComponent } from './components/bulk-transfer/bulk-transfer.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AngularMultiSelectModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule,
    NgSelectModule,
    ProfileModule,
    PassbookModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    ...accountsServices.services,
    ...passbookServices.services,
    ...payeeServices.services,
    ...VpaServices.services,
    DecimalPipe,
    ...transfersServices.services,
    ...transfersGuards.guards,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    ...transfersContainers.containers,
    ...transfersComponents.components,
    // ScheduledTransferComponent,
    BulkTransferOverviewComponent,
    BulkTransferComponent,
  ],
  exports: [
    ...transfersContainers.containers,
    ...transfersComponents.components
  ]
})
export class TransfersModule {}

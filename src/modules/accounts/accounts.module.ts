/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { FixedDepositModule } from '@modules/fixed-deposit/fixed-deposit.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { StyleReferenceModule } from '@modules/style-reference/style-reference.module';
import { TablesModule } from '@modules/tables/tables.module';
import { DocumentsModule } from '@modules/documents/documents.module';
import { StatementsModule } from '@modules/statements/statements.module';
/* Components */
import * as accountsComponents from './components';
import * as merchantComponents from '@modules/merchant/components';

/* Containers */
import * as accountsContainers from './containers';

/* Directives */
import * as accountsDirectives from './directives';

/* Guards */
import * as accountsGuards from './guards';

/* Services */
import * as accountsServices from './services';
import * as merchantServices from '@modules/merchant/services';
import * as profileServices from '@modules/profile/services';
import { PayeeService } from '@modules/payee/services';
import { FixedDepositService } from '@modules/fixed-deposit/services';
import { NgSelectModule } from '@ng-select/ng-select';
import { TwoDigitDecimalNumberDirective } from '@modules/transfers/components';
import { ActivityLogsModule } from '@modules/activity-logs/activity-logs.module';
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
    StyleReferenceModule,
    TablesModule,
    NgSelectModule,
    DocumentsModule,
    FixedDepositModule,
    DragDropModule,
    StatementsModule,
    ActivityLogsModule,
    NgxSpinnerModule
  ],
  providers: [
    PayeeService,
    FixedDepositService,
    ...accountsGuards.guards,
    DecimalPipe,
    ...merchantServices.services,
    ...profileServices.services,
    ...accountsServices.services,
    ...accountsDirectives.directives,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],

  declarations: [
    ...accountsContainers.containers,
    ...accountsComponents.components,
    ...accountsDirectives.directives
  ],
  exports: [...accountsContainers.containers, ...accountsComponents.components]
})
export class AccountsModule {}

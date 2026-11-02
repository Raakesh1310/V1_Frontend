/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

/* Components */
import * as transactionsComponents from './components';
import { NgxPrintModule } from 'ngx-print';

/* Containers */
import * as transactionsContainers from './containers';

/* Directives */
import * as transactionsDirectives from './directives';

/* Guards */
import * as transactionsGuards from './guards';

/* Services */
import * as transactionsServices from './services';
import { AccountsService } from '@modules/accounts/services';

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
    NgxPrintModule
  ],
  providers: [
    AccountsService,
    DecimalPipe,
    ...transactionsServices.services,
    ...transactionsGuards.guards,
    ...transactionsDirectives.directives,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
    // { provide: NgbDateParserFormatter, useClass: NgbDateParserService, multi: true }
  ],
  declarations: [
    ...transactionsContainers.containers,
    ...transactionsComponents.components,
    ...transactionsDirectives.directives
  ],
  exports: [
    ...transactionsContainers.containers,
    ...transactionsComponents.components
  ]
})
export class TransactionsModule {}

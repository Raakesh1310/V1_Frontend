/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import EscrowPageWidgetComponent from '@modules/escrow-page-widgets/components/escrow-page-widget.class';
import { EscrowPageWidgetsModule } from '@modules/escrow-page-widgets/escrow-page-widgets.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgxPrintModule } from 'ngx-print';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';

/* Components */
import * as escrowPagesComponents from './components';

/* Containers */
import * as escrowPagesContainers from './containers';

/* Guards */
import * as escrowPagesGuards from './guards';

/* Services */
import * as escrowPagesServices from './services';
// import { EscrowPagesComponent } from '@modules/escrow-pages/containers';
// import { EscrowPagesFormComponent } from '@modules/escrow-pages/containers';
// import { EscrowPagesListComponent } from '@modules/escrow-pages/containers';
// import { PreviewComponent } from '@modules/escrow-pages/components';
// import { EscrowPageFormComponent } from '@modules/escrow-pages/components';
import * as accountsServices from '../accounts/services';
import { NgSelectModule } from '@ng-select/ng-select';
import { EscrowPageListComponent } from './components/escrow-page-list/escrow-page-list.component';
import { EscrowPageCustomerDataComponent } from './components/escrow-page-customer-data/escrow-page-customer-data.component';
import { EscrowPagesCustomerDetailsComponent } from './containers/escrow-pages-customer-details/escrow-pages-customer-details.component';
// import { AddFieldComponent } from '@modules/escrow-pages/components';
// import { EscrowPagesLiveComponent } from '@modules/escrow-pages/containers';

import { NgxSpinnerModule } from 'ngx-spinner';
import { ProfileService } from '@modules/profile/services';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AngularMultiSelectModule,
    FormsModule,
    NgSelectModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule,
    EscrowPageWidgetsModule,
    ClipboardModule,
    NgxPrintModule,
    NgxSpinnerModule
  ],
  providers: [
    ProfileService,
    ...escrowPagesServices.services,
    ...escrowPagesGuards.guards,
    ...accountsServices.services,
    DecimalPipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    ...escrowPagesContainers.containers,
    ...escrowPagesComponents.components,
    EscrowPageListComponent,
    EscrowPageCustomerDataComponent,
    EscrowPagesCustomerDetailsComponent
    // EscrowPagesComponent,
    // EscrowPagesFormComponent,
    // EscrowPagesListComponent,
    // PreviewComponent,
    // EscrowPageFormComponent,
    // AddFieldComponent,
    // EscrowPagesLiveComponent
  ],
  exports: [
    ...escrowPagesContainers.containers,
    ...escrowPagesComponents.components
  ]
})
export class EscrowPagesModule {}

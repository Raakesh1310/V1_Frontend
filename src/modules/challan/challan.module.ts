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
import * as challanComponents from './components';

/* Containers */
import * as challanContainers from './containers';

/* Guards */

import * as challanGuards from './guards';
import { NgxPrintModule } from 'ngx-print';
import { NgSelectModule } from '@ng-select/ng-select';

/* Services */
import * as challanServices from './services';
import * as accountsServices from '../accounts/services';
import {
  ChallanComponent,
  ChallanTablePageComponent
} from '@modules/challan/containers';
import {
  ChallanFormComponent,
  ChallanTableComponent
} from '@modules/challan/components';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { ChallanDetailPageComponent } from './containers/challan-detail-page/challan-detail-page.component';
import { ChallanDetailComponent } from './components/challan-detail/challan-detail.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule,
    NgxPrintModule,
    NgSelectModule
  ],
  providers: [
    ...challanServices.services,
    DecimalPipe,
    ...challanGuards.guards,
    ...accountsServices.services,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
  ],
  declarations: [
    ...challanContainers.containers,
    ...challanComponents.components,
    ChallanComponent,
    ChallanFormComponent,
    ChallanTableComponent,
    ChallanTablePageComponent,
    ChallanDetailPageComponent,
    ChallanDetailComponent
  ],
  exports: [...challanContainers.containers, ...challanComponents.components]
})
export class ChallanModule {}

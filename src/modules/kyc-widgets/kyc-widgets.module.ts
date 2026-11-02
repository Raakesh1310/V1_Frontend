/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as kycWidgetsComponents from './components';

/* Containers */
import * as kycWidgetsContainers from './containers';

/* Guards */
import * as kycWidgetsGuards from './guards';

/* Services */
import * as kycWidgetsServices from './services';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { IndividualKycComponent } from './components/individual-kyc/individual-kyc.component';
import { SelfieKycComponent } from './components/selfie-kyc/selfie-kyc.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule,
    NgxIntlTelInputModule
  ],
  providers: [
    ...kycWidgetsServices.services,
    ...kycWidgetsGuards.guards,
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: TokenInterceptor,
    //   multi: true
    // }
  ],
  declarations: [
    ...kycWidgetsContainers.containers,
    ...kycWidgetsComponents.components,
    IndividualKycComponent,
    SelfieKycComponent
  ],
  exports: [
    ...kycWidgetsContainers.containers,
    ...kycWidgetsComponents.components
  ]
})
export class KycWidgetsModule {}

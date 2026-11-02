/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { AccountsModule } from '@modules/accounts/accounts.module';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { TocModule } from '@modules/toc/toc.module';

/* Components */
import * as profileComponents from './components';

/* Containers */
import * as profileContainers from './containers';

/* Guards */
import * as profileGuards from './guards';
import * as dashboardGuard from '../dashboard/guards';

/* Services */
import * as profileServices from './services';
import * as authServices from '../auth/services';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { ManageTeamComponent } from './components/manage-team/manage-team.component';
import { ProfileBankDetailsComponent } from './components/profile-bank-details/profile-bank-details.component';
import { NotificationSettingsComponent } from './components/notification-settings/notification-settings.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AngularMultiSelectModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule,
    TocModule,
    AccountsModule
  ],
  providers: [
    ...profileServices.services,
    ...authServices.services,
    ...profileGuards.guards,
    ...dashboardGuard.guards,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    ...profileContainers.containers,
    ...profileComponents.components,
    ManageTeamComponent,
    ProfileBankDetailsComponent,
    NotificationSettingsComponent
  ],
  exports: [...profileContainers.containers, ...profileComponents.components]
})
export class ProfileModule {}

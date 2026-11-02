/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as mailComponents from './components';

/* Containers */
import * as mailContainers from './containers';

/* Guards */
import * as mailGuards from './guards';

/* Services */
import * as mailServices from './services';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TokenInterceptor } from '@common/services/token.interceptor';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule,
    NgMultiSelectDropDownModule
  ],
  providers: [
    ...mailServices.services,
    ...mailGuards.guards,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [...mailContainers.containers, ...mailComponents.components],
  exports: [...mailContainers.containers, ...mailComponents.components]
})
export class MailModule {}

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
import * as usersComponents from './components';

/* Containers */
import * as usersContainers from './containers';

/* Guards */
import * as usersGuards from './guards';

/* Services */
import * as usersServices from './services';
import { TokenInterceptor } from '@common/services/token.interceptor';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule
  ],
  providers: [
    ...usersServices.services,
    ...usersGuards.guards,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [...usersContainers.containers, ...usersComponents.components],
  exports: [...usersContainers.containers, ...usersComponents.components]
})
export class UsersModule {}

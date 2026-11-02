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
import * as allUsersComponents from './components';

/* Containers */
import * as allUsersContainers from './containers';

/* Guards */
import * as allUsersGuards from './guards';

/* Services */
import * as allUsersServices from './services';
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
  providers: [...allUsersServices.services, ...allUsersGuards.guards,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [...allUsersContainers.containers, ...allUsersComponents.components],
  exports: [...allUsersContainers.containers, ...allUsersComponents.components]
})
export class AllUsersModule {
}

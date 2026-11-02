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
import * as notificationsComponents from './components';

/* Containers */
import * as notificationsContainers from './containers';

/* Guards */
import * as notificationsGuards from './guards';

/* Services */
import * as notificationsServices from './services';

import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { TokenInterceptor } from '@common/services/token.interceptor';
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
    EditorModule,
    NgxSpinnerModule,
    NgxDaterangepickerMd.forRoot()
  ],
  providers: [
    ...notificationsServices.services,
    ...notificationsGuards.guards,
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    ...notificationsContainers.containers,
    ...notificationsComponents.components
  ],
  exports: [
    ...notificationsContainers.containers,
    ...notificationsComponents.components
  ]
})
export class NotificationsModule {}

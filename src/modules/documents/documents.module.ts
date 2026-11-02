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
import * as documentsComponents from './components';

/* Containers */
import * as documentsContainers from './containers';

/* Guards */
import * as documentsGuards from './guards';

/* Services */
import * as documentsServices from './services';
import { DocumentsOverviewComponent } from './containers/documents-overview/documents-overview.component';
import { DocumentsComponent } from './containers/documents/documents.component';
import { DoqfyFormComponent } from './containers/doqfy-form/doqfy-form.component';
import { DoqfyFormComponentComponent } from './components/doqfy-form-component/doqfy-form-component.component';
import { DoqfyOrderComponentComponent } from './components/doqfy-order-component/doqfy-order-component.component';
import { ListDocumentComponent } from './components/list-document/list-document.component';
import { ListDocumentContainerComponent } from './containers/list-document-container/list-document-container.component';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { NgxPrintModule } from 'ngx-print';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule,
    NgxPrintModule
  ],
  providers: [
    ...documentsServices.services,
    ...documentsGuards.guards,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    ...documentsContainers.containers,
    ...documentsComponents.components,
    DocumentsOverviewComponent,
    DocumentsComponent,
    DoqfyFormComponent,
    DoqfyFormComponentComponent,
    DoqfyOrderComponentComponent,
    ListDocumentComponent,
    ListDocumentContainerComponent
  ],
  exports: [
    ...documentsContainers.containers,
    ...documentsComponents.components
  ]
})
export class DocumentsModule {}

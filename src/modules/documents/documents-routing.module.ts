/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { DocumentsModule } from './documents.module';

/* Containers */
import * as documentsContainers from './containers';

/* Guards */
import * as documentsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [],
    component: documentsContainers.DocumentsComponent,
    children: [
      {
        path: 'form',
        data: {
          title: 'Send for signing',
          breadcrumbs: [
            {
              text: 'E-sign',
              active: true
            }
          ]
        },
        component: documentsContainers.DoqfyFormComponent
      },
      {
        path: 'order',
        data: {
          title: 'Orders',
          breadcrumbs: [
            {
              text: 'orders',
              active: true
            }
          ]
        },
        component: documentsContainers.ListDocumentContainerComponent
      },
      {
        path: 'order/:id',
        data: {
          title: 'view order',
          breadcrumbs: [
            {
              text: 'view order',
              active: true
            }
          ]
        },
        component: documentsContainers.DoqfyOrderComponent
      }
    ]
  }
];

@NgModule({
  imports: [DocumentsModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class DocumentsRoutingModule {}

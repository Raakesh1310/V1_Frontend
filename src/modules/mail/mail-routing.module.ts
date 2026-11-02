/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { MailModule } from './mail.module';

/* Containers */
import * as mailContainers from './containers';

/* Guards */
import * as mailGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [],
    component: mailContainers.MailPageComponent,
    children: [
      {
        path: '',
        data: {
          title: 'List Mails',
          breadcrumbs: [
            {
              text: 'list',
              active: true
            }
          ]
        } as SBRouteData,
        component: mailContainers.MailListPageComponent
      },
      {
        path: 'form',
        data: {
          title: 'Create Email',
          breadcrumbs: [
            {
              text: 'mail',
              active: true
            }
          ]
        } as SBRouteData,
        component: mailContainers.MailFormPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [MailModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class MailRoutingModule {}

/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { NotificationsModule } from './notifications.module';

/* Containers */
import * as notificationsContainers from './containers';

import { NotificationsFormComponent } from './components';
import { NotificationsListComponent } from './components/notifications-list/notifications-list.component';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [],
    component: notificationsContainers.NotificationsComponent,
    children: [
      {
        path: '',
        component: NotificationsListComponent
      },
      {
        path: 'create',
        component: NotificationsFormComponent
      }
    ]
  }
];

@NgModule({
  imports: [NotificationsModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule {}

/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavigationGuard } from '@modules/navigation/guards';
import { SBRouteData } from '@modules/navigation/models';

/* Module */
import { ActivityLogsModule } from './activity-logs.module';

/* Containers */
import * as activityLogsContainers from './containers';

/* Guards */
import * as activityLogsGuards from './guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    component: activityLogsContainers.ActivityLogsComponent,
    children: [
      {
        path: '',
        data: {
          title: 'Logs',
          breadcrumbs: [
            {
              text: 'Logs',
              active: true
            }
          ]
        } as SBRouteData,
        component: activityLogsContainers.ActivityLogsComponent
      }
    ]
  }
];

@NgModule({
  imports: [ActivityLogsModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class ActivityLogsRoutingModule {}

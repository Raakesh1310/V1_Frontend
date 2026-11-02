/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from '@modules/navigation/models';

/* Module */
import { helpdeskModule } from './helpdesk.module';

/* Containers */
import * as helpdeskContainers from './containers';

/* Guards */
import * as helpdeskGuards from './guards';
import { NavigationGuard } from '@modules/navigation/guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    component: helpdeskContainers.HelpdeskComponent,
    children: [
      {
        path: '',
        data: {
          title: 'helpdesk',
          breadcrumbs: [
            {
              text: 'create',
              active: true
            }
          ]
        } as SBRouteData,
        component: helpdeskContainers.HelpdeskOverviewComponent
      },
      {
        path: 'track',
        data: {
          title: 'helpdesktrack',
          breadcrumbs: [
            {
              text: 'track',
              active: true
            }
          ]
        } as SBRouteData,
        component: helpdeskContainers.HelpdeskTrackComponent
      }
    ]
  }
];

@NgModule({
  imports: [helpdeskModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class HelpdeskRoutingModule {}

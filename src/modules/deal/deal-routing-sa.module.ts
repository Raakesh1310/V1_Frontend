/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { DealModule } from './deal.module';

/* Containers */
import * as dealContainers from './containers';

/* Guards */
import * as dealGuards from './guards';
import { NavigationGuard } from '@modules/navigation/guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    component: dealContainers.DealPageComponent,
    children: [
      {
        path: '',
        data: {
          title: 'Deals',
          breadcrumbs: [
            {
              text: 'list',
              active: true
            }
          ]
        } as SBRouteData,
        component: dealContainers.AllDealsPageComponent
      },
      {
        path: ':dealId',
        data: {
          title: 'Deals Details',
          breadcrumbs: [
            {
              text: 'detail',
              active: true
            }
          ]
        } as SBRouteData,
        component: dealContainers.DealDetailAdminPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [DealModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class DealRoutingSaModule {}

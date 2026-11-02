/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavigationGuard } from '@modules/navigation/guards';
import { SBRouteData } from '@modules/navigation/models';

/* Module */
import { ChallanModule } from './challan.module';

/* Containers */
import * as challanContainers from './containers';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    component: challanContainers.ChallanComponent,
    children: [
      {
        path: '',
        data: {
          title: 'Challans',
          breadcrumbs: [
            {
              text: 'create',
              active: true
            }
          ]
        } as SBRouteData,
        component: challanContainers.ChallanTablePageComponent
      },
      {
        path: 'form',
        data: {
          title: 'Challans',
          breadcrumbs: [
            {
              text: 'create',
              active: true
            }
          ]
        } as SBRouteData,
        component: challanContainers.ChallanFormPageComponent
      },
      {
        path: ':challanId',
        data: {
          title: 'Challans',
          breadcrumbs: [
            {
              text: 'create',
              active: true
            }
          ]
        } as SBRouteData,
        component: challanContainers.ChallanDetailPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [ChallanModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class ChallanRoutingSaModule {}

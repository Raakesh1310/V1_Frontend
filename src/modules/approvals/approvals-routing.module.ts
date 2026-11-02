/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { ApprovalsModule } from './approvals.module';

/* Containers */
import * as approvalsContainers from './containers';

/* Guards */
import { NavigationGuard } from '@modules/navigation/guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    component: approvalsContainers.ApprovalsComponent,
    children: [
      {
        path: '',
        data: {
          title: 'Approvals',
          breadcrumbs: [
            {
              text: 'create',
              active: true
            }
          ]
        } as SBRouteData,
        component: approvalsContainers.ApprovalOverviewComponent
      },
      {
        path: ':id',
        data: {
          title: 'Approvals',
          breadcrumbs: [
            {
              text: 'create',
              active: true
            }
          ]
        } as SBRouteData,
        component: approvalsContainers.BulkApprovalDetailOverviewComponent
      }
    ]
  }
];

@NgModule({
  imports: [ApprovalsModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class ApprovalsRoutingModule {}

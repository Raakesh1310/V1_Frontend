/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { MilestoneModule } from './milestone.module';

/* Containers */
import * as milestonesContainers from './containers';

/* Guards */
import * as milestonesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';
import { NavigationGuard } from '@modules/navigation/guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    children: [
      {
        path: '',
        component: milestonesContainers.MilestoneListPageComponent,
        data: {
          title: 'Milestones List',
          breadcrumbs: [{ text: 'Milestone', active: true }]
        } as SBRouteData
      },
      {
        path: 'create',
        component: milestonesContainers.MilestoneFormPageComponent,
        data: {
          title: 'New Milestone',
          breadcrumbs: [{ text: 'Milestone', active: true }]
        } as SBRouteData
      },
      {
        path: ':milestoneId',
        component: milestonesContainers.MilestoneDetailPageComponent,
        data: {
          title: 'Milestone Details',
          breadcrumbs: [{ text: 'Milestone', active: true }]
        } as SBRouteData
      }
    ]
  }
];

@NgModule({
  imports: [MilestoneModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class MilestoneRoutingModule {}

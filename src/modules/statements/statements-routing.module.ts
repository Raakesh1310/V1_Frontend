/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { StatementsModule } from './statements.module';

/* Containers */
import * as statementsContainers from './containers';

/* Guards */
import * as statementsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [],
    component: statementsContainers.StatementComponent,
    children: [
      {
        path: '',
        data: {
          title: 'Statement-list',
          breadcrumbs: [
            {
              text: 'Statement List',
              active: true
            }
          ]
        } as SBRouteData,
        component: statementsContainers.StatementListPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [StatementsModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class StatementsRoutingModule {}

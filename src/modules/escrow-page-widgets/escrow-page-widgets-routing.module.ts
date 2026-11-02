/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { EscrowPageWidgetsModule } from './escrow-page-widgets.module';

/* Containers */
import * as escrowPageWidgetsContainers from './containers';

/* Guards */
import * as escrowPageWidgetsGuards from './guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [],
    component: escrowPageWidgetsContainers.EscrowPageWidgetsContainerComponent,
    children: [
      {
        path: '',
        component: escrowPageWidgetsContainers.EscrowPageWidgetsPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [EscrowPageWidgetsModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class EscrowPageWidgetsRoutingModule {}

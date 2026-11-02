/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from '@modules/navigation/models';

/* Module */
import { EscrowPagesModule } from './escrow-pages.module';

/* Containers */
import * as escrowPagesContainers from './containers';

/* Guards */
import * as escrowPagesGuards from './guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: ':escrowPageId',
    canActivate: [],
    component: escrowPagesContainers.EscrowPagesLiveComponent,
    data: {
      includeDashboardLayout: false
    } as SBRouteData
  }
];

@NgModule({
  imports: [EscrowPagesModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class EscrowPagesRoutingModule {}

/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from '@modules/navigation/models';

/* Module */
import { TransfersModule } from './transfers.module';

/* Containers */
import * as transferContainers from './containers';

/* Guards */
import * as transferGuards from './guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: ':transferId/authorization/:verificationId',
    canActivate: [],
    component: transferContainers.TransferAuthorizationPageComponent,
    data: {
      includeDashboardLayout: false
    } as SBRouteData
  }
];

@NgModule({
  imports: [TransfersModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class TransferRoutingModule {}

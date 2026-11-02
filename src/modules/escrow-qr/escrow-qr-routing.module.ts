/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { EscrowQrModule } from './escrow-qr.module';

/* Containers */
import * as escrowQrContainers from './containers';

/* Components */
import * as escrowQrComponents from './components';

/* Guards */
import * as escrowQrGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [
    {
        path: '',
        canActivate: [],
        children: [
          {
            path: '',
            data: {
              title: 'View Escrow QR List',
              breadcrumbs: [
                {
                  text: 'View Escrow QR List',
                  active: true
                }
              ]
            } as SBRouteData,
            component: escrowQrContainers.EscrowQrComponent
          },
          {
            path: ':id',
            data: {
              title: 'View Data',
              breadcrumbs: [
                {
                  text: 'View Data',
                  active: true
                }
              ]
            } as SBRouteData,
            component: escrowQrComponents.EscrowQrDataComponent
          }
        ]
      }
];

@NgModule({
    imports: [EscrowQrModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class EscrowQrRoutingModule {}

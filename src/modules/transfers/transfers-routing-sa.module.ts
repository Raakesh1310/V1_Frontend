/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from '@modules/navigation/models';
/* Module */
import { TransfersModule } from './transfers.module';

/* Containers */
import * as transfersContainers from './containers';
import * as passbookContainers from '@modules/passbook/containers';

/* Guards */
import * as transfersGuards from './guards';
import { NavigationGuard } from '@modules/navigation/guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    component: transfersContainers.TransferComponent,
    children: [
      {
        path: '',
        data: {
          title: 'Transfers',
          breadcrumbs: [
            {
              text: 'Transfers',
              active: true
            }
          ]
        } as SBRouteData,
        component: transfersContainers.AllFundTransfersComponent
      },
      {
        path: 'bank-account',
        data: {
          title: 'Bank Account Transfers',
          breadcrumbs: [
            {
              text: 'Transfers',
              active: true
            }
          ]
        } as SBRouteData,
        component: transfersContainers.BankAccountTransferComponent
      },
      {
        path: ':id',
        data: {
          title: 'Transfer Detail',
          breadcrumbs: [
            {
              text: 'Transfers',
              active: true
            } 
          ]
        } as SBRouteData,
        component: passbookContainers.TransferDetailsPageComponent
      },
      {
        path: 'scheduled',
        data: {
          title: 'Scheduled Transfers',
          breadcrumbs: [
            {
              text: 'Scheduled Transfers',
              active: true
            }
          ]
        } as SBRouteData,
        component: transfersContainers.ScheduledTransferComponent
      },
      {
        path: 'scheduled/:id',
        data: {
          title: 'Scheduled Transfers',
          breadcrumbs: [
            {
              text: 'Scheduled Transfers',
              active: true
            }
          ]
        } as SBRouteData,
        component: transfersContainers.ScheduledTransferSaDetailsComponent
      },
      {
        path: 'bulk-transfer/:id',
        data: {
          title: 'Outward Fund Transfer Details',
          breadcrumbs: [
            {
              text: 'Outward Fund Transfer Details',
              active: true
            }
          ]
        } as SBRouteData,
        component: passbookContainers.BulkTransferDetailsPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [TransfersModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class TransfersRoutingSaModule {}

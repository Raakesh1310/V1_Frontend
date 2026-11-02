/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from '@modules/navigation/models';
/* Module */
import { TransfersModule } from './transfers.module';

/* Containers */
import * as transfersContainers from './containers';

/* Guards */
import { NavigationGuard } from '@modules/navigation/guards';
import { Transfer_form_guard } from '@modules/transfers/guards/transfer_form_guard';
import { TransfersGuard } from '@modules/transfers/guards';
import * as passbookContainers from '@modules/passbook/containers';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard, TransfersGuard],
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
        component: transfersContainers.TransferOverviewComponent
        //canDeactivate: [Transfer_form_guard]
      },
      {
        path: 'bulk',
        data: {
          title: 'Transfers',
          breadcrumbs: [
            {
              text: 'Transfers',
              active: true
            }
          ]
        } as SBRouteData,
        component: transfersContainers.BulkTransferOverviewComponent
        //canDeactivate: [Transfer_form_guard]
      },
      // {
      //   path: 'upi',
      //   data: {
      //     title: 'Transfers',
      //     breadcrumbs: [
      //       {
      //         text: 'Transfers',
      //         active: true
      //       }
      //     ]
      //   } as SBRouteData,
      //   component: transfersContainers.UpiTransferOverviewComponent
      //   //canDeactivate: [Transfer_form_guard]
      // },
      // {
      //   path: 'upi/bank-accounts',
      //   data: {
      //     title: 'Transfers',
      //     breadcrumbs: [
      //       {
      //         text: 'Transfers',
      //         active: true
      //       }
      //     ]
      //   } as SBRouteData,
      //   component: transfersContainers.UpiBankAccountTransferOverviewComponent
      //   //canDeactivate: [Transfer_form_guard]
      // },
      {
        path: 'bank-accounts',
        data: {
          title: 'Transfers',
          breadcrumbs: [
            {
              text: 'Transfers',
              active: true
            }
          ]
        } as SBRouteData,
        component: transfersContainers.TransferBankAccountOverviewComponent
        //canDeactivate: [Transfer_form_guard]
      },
      {
        path: 'bulk/bank-accounts',
        data: {
          title: 'Transfers',
          breadcrumbs: [
            {
              text: 'Transfers',
              active: true
            }
          ]
        } as SBRouteData,
        component: transfersContainers.BulkTransferBankAccountOverviewComponent
        //canDeactivate: [Transfer_form_guard]
      },
      {
        path: 'all',
        data: {
          title: 'All Transfers',
          breadcrumbs: [
            {
              text: 'All Transfers',
              active: true
            }
          ]
        } as SBRouteData,
        component: transfersContainers.AllFundTransfersComponent
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
          title: 'Scheduled Transfer Details',
          breadcrumbs: [
            {
              text: 'Scheduled Transfer Details',
              active: true
            }
          ]
        } as SBRouteData,
        component: transfersContainers.ScheduledTransferDetailsComponent
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
export class TransfersRoutingModule {}

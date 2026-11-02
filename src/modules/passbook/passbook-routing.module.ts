/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from '@modules/navigation/models';

/* Module */
import { PassbookModule } from './passbook.module';

/* Containers */
import * as passbookContainers from './containers';

/* Guards */
import * as passbookGuards from './guards';
import { NavigationGuard } from '@modules/navigation/guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    component: passbookContainers.PassbookComponent,
    children: [
      {
        path: '',
        data: {
          title: 'Outward Fund Transfer',
          breadcrumbs: [
            {
              text: 'Outward Fund Transfer',
              active: true
            }
          ]
        } as SBRouteData,
        component: passbookContainers.PassbookOverviewComponent
      },
      {
        path: 'bank-accounts',
        data: {
          title: 'Outward Fund Transfer',
          breadcrumbs: [
            {
              text: 'Outward Fund Transfer',
              active: true
            }
          ]
        } as SBRouteData,
        component: passbookContainers.PassbookOverviewBankAccountsComponent
      },
      {
        path: ':id',
        data: {
          title: 'Outward Fund Transfer Details',
          breadcrumbs: [
            {
              text: 'Outward Fund Transfer Details',
              active: true
            }
          ]
        } as SBRouteData,
        component: passbookContainers.TransferDetailsPageComponent
      }
      // {
      //   path: 'bulk-transfer/:id',
      //   data: {
      //     title: 'Outward Fund Transfer Details',
      //     breadcrumbs: [
      //       {
      //         text: 'Outward Fund Transfer Details',
      //         active: true
      //       }
      //     ]
      //   } as SBRouteData,
      //   component: passbookContainers.BulkTransferDetailsPageComponent
      // }
    ]
  }
];

@NgModule({
  imports: [PassbookModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class PassbookRoutingModule {}

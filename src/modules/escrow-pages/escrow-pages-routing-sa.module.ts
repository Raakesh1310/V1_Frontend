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
import { NavigationGuard } from '@modules/navigation/guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    component: escrowPagesContainers.EscrowPagesComponent,
    data: { includeDashboardLayout: true } as SBRouteData,
    children: [
      // {
      //   path: 'form',
      //   data: {
      //     title: 'Create-escrow-page',
      //     breadcrumbs: [
      //       {
      //         text: 'Create Page',
      //         active: true
      //       }
      //     ]
      //   },
      //   component: escrowPagesContainers.EscrowPagesFormComponent
      // },
      {
        path: '',
        data: {
          title: 'List-escrow-page',
          breadcrumbs: [
            {
              text: 'List Pages',
              active: true
            }
          ]
        },
        component: escrowPagesContainers.EscrowListAdminPageComponent
      },
      // {
      //   path: 'preview',
      //   data: {
      //     title: 'preview-escrow-page',
      //     breadcrumbs: [
      //       {
      //         text: 'Preview Pages',
      //         active: true
      //       }
      //     ],
      //     layoutNeeded: false
      //   },
      //   component: escrowPagesContainers.EscrowPagesLiveComponent
      // },

      {
        path: ':escrowPageId',
        data: {
          title: 'Customer Detail',
          breadcrumbs: [
            {
              text: 'customer-detail',
              active: true
            }
          ]
        },
        component: escrowPagesContainers.EscrowCustomerDetailAdminPageComponent
      }
      // {
      //   path: 'preview',
      //   data: {
      //     title: 'preview-escrow-page',
      //     breadcrumbs: [
      //       {
      //         text: 'Preview Pages',
      //         active: true
      //       }
      //     ],
      //     layoutNeeded: false
      //   },
      //   component: escrowPagesContainers.EscrowPagesLiveComponent
      // }
    ]
  }
];

@NgModule({
  imports: [EscrowPagesModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class EscrowPagesSaRoutingModule {}

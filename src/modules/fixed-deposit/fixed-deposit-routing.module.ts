/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { FixedDepositModule } from './fixed-deposit.module';

/* Containers */
import * as fixedDepositContainers from './containers';

/* Guards */
import * as fixedDepositGuards from './guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [],
    component: fixedDepositContainers.FixedDepositComponent,
    children: [
      {
        path: 'list',
        data: {
          title: 'FD List',
          breadcrumbs: [
            {
              text: 'List',
              active: true
            }
          ]
        },
        component: fixedDepositContainers.FixedDepositListContainerComponent
      },
      {
        path: 'form',
        data: {
          title: 'FD Form',
          breadcrumbs: [
            {
              text: 'Create Fixed Deposit',
              active: true
            }
          ]
        },
        component: fixedDepositContainers.FixedDepositFormContainerComponent
      }
      //   {
      //     path: 'order/:id',
      //     data: {
      //       title: 'view order',
      //       breadcrumbs: [
      //         {
      //           text: 'view order',
      //           active: true
      //         }
      //       ]
      //     },
      //     component: documentsContainers.DoqfyOrderComponent
      //   }
    ]
  }
];

@NgModule({
  imports: [FixedDepositModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class FixedDepositRoutingModule {}

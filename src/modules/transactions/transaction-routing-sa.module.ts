/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from '@modules/navigation/models';

/* Module */
import { TransactionsModule } from './transactions.module';

/* Containers */
import * as transactionsContainers from './containers';

/* Guards */
import * as transactionsGuards from './guards';
import { NavigationGuard } from '@modules/navigation/guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    component: transactionsContainers.TransactionsComponent,
    children: [
      {
        path: '',
        data: {
          title: 'Transactions',
          breadcrumbs: [
            {
              text: 'Transactions',
              active: true
            }
          ]
        } as SBRouteData,
        component: transactionsContainers.AllTransactionsComponent
      },
      {
        path: ':id',
        data: {
          title: 'Transaction Details',
          breadcrumbs: [
            {
              text: 'Transaction Details',
              active: true
            }
          ]
        } as SBRouteData,
        component: transactionsContainers.TransactionDetailsPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [TransactionsModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class TransactionRoutingSaModule {}

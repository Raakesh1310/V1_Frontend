import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
/*containers*/
import * as bankAccountContainers from './containers';
import { BankAccountModule } from './bank-account.module';
import { SBRouteData } from '@modules/navigation/models';
import { NavigationGuard } from '@modules/navigation/guards';

const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    component: bankAccountContainers.BankAccountBgComponent,
    children: [
      {
        path: '',
        data: {
          title: 'Bank Account',
          breadcrumbs: [
            {
              text: 'bank-account',
              active: true
            }
          ]
        } as SBRouteData,
        component: bankAccountContainers.BankAccountPageComponent
      },
      {
        path: 'deposit',
        data: {
          title: 'Deposits',
          breadcrumbs: [{ text: 'All Deposits', active: true }]
        } as SBRouteData,
        component: bankAccountContainers.AllDepositsComponent
      },
      {
        path: ':accountId',
        data: {
          title: 'Bank Account Detail',
          breadcrumbs: [{ text: 'Bank Account', active: true }]
        } as SBRouteData,
        component: bankAccountContainers.StatementPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [BankAccountModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class BankAccountRoutingModule {}

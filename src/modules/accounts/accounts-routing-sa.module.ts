/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountsGuard } from '@modules/accounts/guards';
import { NavigationGuard } from '@modules/navigation/guards';
import { SBRouteData } from '@modules/navigation/models';

/* Module */
import { AccountsModule } from './accounts.module';

/* Containers */
import * as accountsContainers from './containers';

/* Guards */
// import * as accountsGuards from './guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    component: accountsContainers.AccountPageComponent,
    children: [
      {
        path: '',
        data: {
          title: 'Accounts',
          breadcrumbs: [
            {
              text: 'Accounts',
              active: true
            }
          ]
        } as SBRouteData,
        component: accountsContainers.AllAccountsPageComponent
      },
      {
        path: 'form',
        data: {
          title: 'Escrow',
          breadcrumbs: [
            {
              text: 'Escrow',
              active: true
            }
          ]
        } as SBRouteData,
        component: accountsContainers.AccountsFormPageComponent
      },
      {
        path: ':accountId',
        data: {
          title: 'Account Detail',
          breadcrumbs: [
            {
              text: 'Account Detail',
              active: true
            }
          ]
        } as SBRouteData,
        component: accountsContainers.AccountDetailAdminPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [AccountsModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }

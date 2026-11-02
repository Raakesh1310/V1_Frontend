/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { MerchantModule } from './merchant.module';

/* Containers */
import * as merchantContainers from './containers';

/* Components */
import * as merchantComponents from './components';

/* Guards */
import * as merchantGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [],
    component: merchantContainers.MerchantPageComponent,
    children: [
      {
        path: '',
        data: {
          title: 'Merchants',
          breadcrumbs: [{ text: 'Merchants', active: true }]
        } as SBRouteData,
        component: merchantContainers.MerchantListPageComponent
      },
      {
        path: 'form',
        data: {
          title: 'Create Merchant',
          breadcrumbs: [{ text: 'Create Merchant', active: true }]
        } as SBRouteData,
        component: merchantContainers.MerchantCreateComponent
      },
      {
        path: ':merchantId',
        data: {
          title: 'Merchant Detail',
          breadcrumbs: [{ text: 'Merchants', active: true }]
        } as SBRouteData,
        component: merchantContainers.MerchantDetailAdminContainerComponent
      }
    ]
  }
];

@NgModule({
  imports: [MerchantModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class MerchantRoutingModule {}

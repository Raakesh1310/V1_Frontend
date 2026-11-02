/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { KycWidgetsModule } from './kyc-widgets.module';

/* Containers */
import * as kycWidgetsContainers from './containers';

import * as kycWidgetsComponents from './components';

/* Guards */

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [],
    component: kycWidgetsContainers.KycWidgetBaseComponent,
    children: [
      {
        path: 'login/:crnId',
        component: kycWidgetsContainers.KycWidgetMobileEmailComponent
      },
      {
        path: 'business-Details/:crnId',
        component: kycWidgetsContainers.KycWidgetBusinessDetailsComponent
      },
      {
        path: 'success/:crnId',
        component: kycWidgetsComponents.KycSuccessComponent
      },
    ]
  }
];

@NgModule({
  imports: [KycWidgetsModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class KycWidgetsRoutingModule {
}

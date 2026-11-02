/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/* Module */
import { PayeeModule } from './payee.module';

/* Containers */
import * as payeeContainers from './containers';

/* Guards */
import { NavigationGuard } from '@modules/navigation/guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    children: [
      {
        path: '',
        data: {
          title: 'View Payee List',
          breadcrumbs: [
            {
              text: 'View Payee List',
              active: true,
            },
          ],
        } as SBRouteData,
        component: payeeContainers.PayeeListComponent,
      },
      {
        path: 'form',
        data: {
          title: 'Add Payee',
          breadcrumbs: [
            {
              text: 'Add Payee',
              active: true,
            },
          ],
        } as SBRouteData,
        component: payeeContainers.AddPayeeComponent,
        //canDeactivate: [Payee_form_guard],
      },
      {
        path: 'validation',
        data: {
          title: 'Payee Validation',
          breadcrumbs: [
            {
              text: 'Payee Validation',
              active: true,
            },
          ],
        } as SBRouteData,
        component: payeeContainers.PayeeValidationContainer,
        //canDeactivate: [Payee_form_guard],
      },
      {
        path: ':id',
        data: {
          title: 'View Payee',
          breadcrumbs: [
            {
              text: 'View Payee',
              active: true,
            },
          ],
        } as SBRouteData,
        component: payeeContainers.PayeeDetailComponent,
      },
    ],
  },
];

@NgModule({
  imports: [PayeeModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class PayeeRoutingModule { }

/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { InvoicesModule } from './invoices.module';

/* Containers */
import * as invoicesContainers from './containers';

/* Guards */
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [],
    component: invoicesContainers.InvoicesComponent,
    children: [
      {
        path: '',
        data: {
          title: 'Invoices',
          breadcrumbs: [
            {
              text: 'Invoices',
              active: true
            }
          ]
        } as SBRouteData,
        component: invoicesContainers.ListPageComponent
      },
      {
        path: ':invoiceId/summary',
        data: {
          title: 'Summary Bill',
          breadcrumbs: [
            {
              text: 'Invoices',
              active: true
            }
          ]
        } as SBRouteData,
        component: invoicesContainers.SummaryBillPageComponent
      },
      {
        path: ':invoiceId/detailed',
        data: {
          title: 'Detailed Bill',
          breadcrumbs: [
            {
              text: 'Invoices',
              active: true
            }
          ]
        } as SBRouteData,
        component: invoicesContainers.DetailedBillPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [InvoicesModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class InvoicesRoutingModule {}

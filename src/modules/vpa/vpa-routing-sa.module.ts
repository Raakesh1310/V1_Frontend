/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { VpaModule } from './vpa.module';

/* Containers */
import * as vpaContainers from './containers';

/* Guards */
import { NavigationGuard } from '@modules/navigation/guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [NavigationGuard],
    component: vpaContainers.AllVpasComponent
  }
];

@NgModule({
  imports: [VpaModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class VpaRoutingModule {}

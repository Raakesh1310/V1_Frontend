/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { PartiesModule } from './parties.module';

/* Routes */
export const ROUTES: Routes = [
    // {
    //     path: '',
    //     canActivate: [],
    //     component: partiesContainers.PartiesComponent,
    // },
];

@NgModule({
    imports: [PartiesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class PartiesRoutingModule {}

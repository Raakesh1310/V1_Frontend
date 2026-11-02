/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { PartiesModule } from './parties.module';

/* Containers */
import * as partiesContainers from './containers';

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
                            active: true
                        }
                    ]
                } as SBRouteData,
            }
        ],
        component: partiesContainers.PartiesComponent,
    },
];

@NgModule({
    imports: [PartiesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class PartiesRoutingSaModule { }

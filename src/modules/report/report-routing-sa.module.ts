/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { ReportModule } from './report.module';

/* Containers */
import * as reportContainers from './containers';

/* Guards */
import * as reportGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [
    {
        path: '',
        // canActivate: [],
        component: reportContainers.ReportOverviewComponent,
        children: [
            {
                path: '',
                data: {
                    title: 'Report',
                    breadcrumbs: [
                        {
                            text: 'report',
                            active: true
                        }
                    ]
                } as SBRouteData,
                component: reportContainers.ReportListOverviewComponent
            }]
    },
];

@NgModule({
    imports: [ReportModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class ReportRoutingSaModule { }

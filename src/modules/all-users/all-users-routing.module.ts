/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from '@modules/navigation/models';

/* Module */
import { AllUsersModule } from './all-users.module';

/* Containers */
import * as allUsersContainers from './containers';

/* Guards */
import * as allUsersGuards from './guards';

/* Routes */
export const ROUTES: Routes = [
    {
        path: '',
        canActivate: [],
        component: allUsersContainers.KycOutlineComponent,
        children: [
              {
                path: '',
                data: {
                  title: 'All Users',
                  breadcrumbs: [
                    {
                      text: 'allUsers',
                      active: true
                    }
                  ]
                } as SBRouteData,
                component: allUsersContainers.KycOverviewComponent,
                //canDeactivate: [Transfer_form_guard]
              },
              {
                path: ':id',
                data: {
                  title: 'All Users',
                  breadcrumbs: [
                    {
                      text: '',
                      active: true
                    }
                  ]
                } as SBRouteData,
                component: allUsersContainers.KycDetailAdminPageComponent,
                //canDeactivate: [Transfer_form_guard]
              }
        ]
    }
    // {
    //     path: '',
    //     canActivate: [],
    //     component: allUsersContainers.AllUsersComponent,
    // },
];

@NgModule({
    imports: [AllUsersModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class AllUsersRoutingModule {}

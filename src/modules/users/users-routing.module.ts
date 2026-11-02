/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/* Module */
import { UsersModule } from './users.module';

/* Containers */
import * as usersContainers from './containers';

/* Guards */
import { SBRouteData } from '@modules/navigation/models';
import { UsersGuard } from './guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [UsersGuard],
    children: [
      {
        path: '',
        data: {
          title: 'All User',
          breadcrumbs: [
            {
              text: 'View User',
              active: true
            }
          ]
        } as SBRouteData,
        component: usersContainers.ListUserComponent
      },
      {
        path: ':userId',
        data: {
          title: 'User Detail',
          breadcrumbs: [{ text: 'View User', active: true }]
        } as SBRouteData,
        component: usersContainers.UserDetailsComponent
      }
    ]
  }
];

@NgModule({
  imports: [UsersModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class UsersRoutingModule {}

/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as dashboardContainers from '@modules/dashboard/containers';
import { SBRouteData } from '@modules/navigation/models';

/* Module */
import { ProfileModule } from './profile.module';

/* Containers */
import * as profileContainers from './containers';

/* Guards */
import * as profileGuards from './guards';
import { NavigationGuard } from '@modules/navigation/guards';
import { DashboardGuard } from '@modules/dashboard/guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    component: profileContainers.ProfileComponent,
    children: [
      {
        path: '',
        canActivate: [DashboardGuard],
        data: {
          title: 'Profile',
          breadcrumbs: [
            {
              text: 'Profile',
              active: true
            }
          ]
        } as SBRouteData,
        component: profileContainers.ProfileOverviewComponent
      },
      {
        path: 'teams',
        canActivate: [NavigationGuard],
        data: {
          title: 'Manage Teams',
          breadcrumbs: [
            {
              text: 'teams',
              active: true
            }
          ]
        } as SBRouteData,
        component: profileContainers.ManageTeamOverviewComponent
      },
      {
        path: 'settings',
        canActivate: [NavigationGuard],
        data: {
          title: 'Settings',
          breadcrumbs: [
            {
              text: 'settings',
              active: true
            }
          ]
        } as SBRouteData,
        component: profileContainers.ProfileSettingsComponent
      },
      {
        path: 'all',
        data: {
          title: 'User KYC',
          breadcrumbs: [
            {
              text: 'User KYC',
              active: true
            }
          ]
        } as SBRouteData,
        component: profileContainers.UserKycComponent
      },
      {
        path: 'user-kyc-details',
        data: {
          title: 'KYC Details',
          breadcrumbs: [
            {
              text: 'KYC Details',
              active: true
            }
          ]
        } as SBRouteData,
        component: profileContainers.UserKycDetailsComponent
      }
    ]
  }
];

@NgModule({
  imports: [ProfileModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}

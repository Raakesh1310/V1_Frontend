/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from '@modules/navigation/models';

/* Module */
import { DashboardModule } from './dashboard.module';

/* Containers */
import * as dashboardContainers from './containers';
import * as styleReferenceContainers from '@modules/style-reference/containers';

/* Guards */
import * as dashboardGuards from './guards';

import { styleReferenceRouteVariables } from '@modules/style-reference/models';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [dashboardGuards.DashboardGuard],
    component: dashboardContainers.DashboardComponent,
    children: [
      {
        path: '',
        data: {
          title: 'Dashboard - Castler',
          breadcrumbs: [
            {
              text: 'Dashboard',
              active: true
            }
          ]
        } as SBRouteData,
        component: dashboardContainers.DashboardEscrowCbOverviewComponent
      },
      {
        path: 'multipurpose',
        data: {
          title: 'Dashboard Multipurpose - Castler',
          breadcrumbs: [
            {
              text: 'Dashboard',
              link: '/dashboard'
            },
            {
              text: 'Multipurpose',
              active: true
            }
          ]
        } as SBRouteData,
        component: dashboardContainers.DashboardMultipurposeComponent
      },
      {
        path: 'affiliate',
        data: {
          title: 'Dashboard Affiliate - Castler',
          breadcrumbs: [
            {
              text: 'Dashboard',
              link: '/dashboard'
            },
            {
              text: 'Affiliate',
              active: true
            }
          ]
        } as SBRouteData,
        component: dashboardContainers.DashboardAffiliateComponent
      },
      {
        path: 'components',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'alerts'
          },
          ...styleReferenceRouteVariables.components.map(value => ({
            path: value.name,
            data: {
              title: `${value.title} - Castler`,
              breadcrumbs: [
                {
                  text: 'Dashboard',
                  link: '/dashboard'
                },
                {
                  text: value.title,
                  active: true
                }
              ]
            } as SBRouteData,
            component: value.component
          }))
        ]
      },
      {
        path: 'utilities',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'animations'
          },
          ...styleReferenceRouteVariables.utilities.map(value => ({
            path: value.name,
            data: {
              title: `${value.title} - Castler`,
              breadcrumbs: [
                {
                  text: 'Dashboard',
                  link: '/dashboard'
                },
                {
                  text: value.title,
                  active: true
                }
              ]
            } as SBRouteData,
            component: value.component
          }))
        ]
      },
      {
        path: 'page-headers',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'simplified'
          },
          ...styleReferenceRouteVariables.pageHeaders.map(value => ({
            path: value.name,
            data: {
              title: `${value.title} - Castler`,
              breadcrumbs: [
                {
                  text: 'Dashboard',
                  link: '/dashboard'
                },
                {
                  text: value.title,
                  active: true
                }
              ]
            } as SBRouteData,
            component: value.component
          }))
        ]
      },
      {
        path: 'pages',
        children: [
          {
            path: 'blank',
            component: styleReferenceContainers.BlankComponent,
            data: {
              title: 'Pages Blank - Castler',
              breadcrumbs: [
                {
                  text: 'Dashboard',
                  link: '/dashboard'
                },
                {
                  text: 'Blank',
                  active: true
                }
              ]
            } as SBRouteData
          }
        ]
      }
    ]
  },
  {
    path: 'static',
    data: {
      title: 'Dashboard Static - Castler',
      breadcrumbs: [
        {
          text: 'Dashboard',
          link: '/dashboard'
        },
        {
          text: 'Static',
          active: true
        }
      ]
    } as SBRouteData,
    component: dashboardContainers.StaticComponent
  },
  {
    path: 'rtl',
    data: {
      title: 'Dashboard RTL - Castler',
      breadcrumbs: [
        {
          text: 'Dashboard',
          link: '/dashboard'
        },
        {
          text: 'RTL',
          active: true
        }
      ]
    } as SBRouteData,
    component: dashboardContainers.RtlComponent
  },
  {
    path: 'dark',
    data: {
      title: 'Dashboard Dark - Castler',
      breadcrumbs: [
        {
          text: 'Dashboard',
          link: '/dashboard'
        },
        {
          text: 'Dark',
          active: true
        }
      ]
    } as SBRouteData,
    component: dashboardContainers.DarkComponent
  }
];

@NgModule({
  imports: [DashboardModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}

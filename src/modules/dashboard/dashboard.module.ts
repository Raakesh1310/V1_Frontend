/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { ChartsModule } from '@modules/charts/charts.module';
import { TablesModule } from '@modules/tables/tables.module';
import { StyleReferenceModule } from '@modules/style-reference/style-reference.module';

/* Components */
import * as dashboardComponents from './components';

/* Containers */
import * as dashboardContainers from './containers';

/* Guards */
import * as dashboardGuards from './guards';

/* Services */
import * as dashboardServices from './services';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { TotalActiveAccountComponent } from './components/total-active-account-card/total-active-account.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DashboardBarChartComponent } from './components/dashboard-bar-chart/dashboard-bar-chart.component';
import { DashboardEscrowCbOverviewComponent } from './containers/dashboard-escrow-cb-overview/dashboard-escrow-cb-overview.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    AppCommonModule,
    NavigationModule,
    ChartsModule,
    TablesModule,
    NgxSkeletonLoaderModule.forRoot(),
    NgxDaterangepickerMd.forRoot(),
    StyleReferenceModule
  ],
  providers: [
    ...dashboardServices.services,
    ...dashboardGuards.guards,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  declarations: [
    ...dashboardContainers.containers,
    ...dashboardComponents.components,
    TotalActiveAccountComponent,
    DashboardBarChartComponent,
    DashboardEscrowCbOverviewComponent
  ],
  exports: [
    ...dashboardContainers.containers,
    ...dashboardComponents.components
  ]
})
export class DashboardModule { }

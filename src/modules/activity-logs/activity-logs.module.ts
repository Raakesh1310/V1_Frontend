/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as activityLogsComponents from './components';

/* Containers */
import * as activityLogsContainers from './containers';

/* Guards */
import * as activityLogsGuards from './guards';

/* Services */
import * as activityLogsServices from './services';
import { TokenInterceptor } from '@common/services/token.interceptor';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        AppCommonModule,
        NavigationModule,
    ],
    providers: [...activityLogsServices.services, ...activityLogsGuards.guards,{
        provide: HTTP_INTERCEPTORS,
        useClass: TokenInterceptor,
        multi: true
      }],
    declarations: [...activityLogsContainers.containers, ...activityLogsComponents.components],
    exports: [...activityLogsContainers.containers, ...activityLogsComponents.components],
})
export class ActivityLogsModule {}

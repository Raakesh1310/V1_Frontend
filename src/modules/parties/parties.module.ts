/* tslint:disable: ordered-imports*/
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as partiesComponents from './components';

/* Containers */
import * as partiesContainers from './containers';

/* Guards */
import * as partiesGuards from './guards';

/* Services */
import * as partiesServices from './services';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        AppCommonModule,
        NavigationModule,
        NgxSpinnerModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [...partiesServices.services, ...partiesGuards.guards,{
        provide: HTTP_INTERCEPTORS,
        useClass: TokenInterceptor,
        multi: true
      }],
    declarations: [...partiesContainers.containers, ...partiesComponents.components],
    exports: [...partiesContainers.containers, ...partiesComponents.components],
})
export class PartiesModule {}

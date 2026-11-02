/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProfileModule } from '@modules/profile/profile.module';
import {NgbDatepickerModule,NgbDropdownModule}from '@ng-bootstrap/ng-bootstrap';

/* Components */
import * as reportComponents from './components';

/* Containers */
import * as reportContainers from './containers';

/* Guards */
import * as reportGuards from './guards';

/* Services */
import * as reportServices from './services';
import * as accountsServices from '../accounts/services';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        AppCommonModule,
        NavigationModule,
        NgSelectModule,
        ProfileModule,
        NgbDatepickerModule,
        // NgbDropdownModule,

    ],
    providers: [...reportServices.services,...accountsServices.services, ...reportGuards.guards,DecimalPipe,],
    declarations: [...reportContainers.containers, ...reportComponents.components],
    exports: [...reportContainers.containers, ...reportComponents.components],
})
export class ReportModule {}

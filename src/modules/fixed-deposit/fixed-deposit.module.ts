/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as fixedDepositComponents from './components';

/* Containers */
import * as fixedDepositContainers from './containers';

/* Guards */
import * as fixedDepositGuards from './guards';

/* Services */
import * as fixedDepositServices from './services';
import {
  FixedDepositComponent,
  FixedDepositFormContainerComponent,
  FixedDepositListContainerComponent
} from '@modules/fixed-deposit/containers';
import { FixedDepositFormComponent } from '@modules/fixed-deposit/components';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule
  ],
  providers: [...fixedDepositServices.services, ...fixedDepositGuards.guards],
  declarations: [
    ...fixedDepositContainers.containers,
    ...fixedDepositComponents.components,
    FixedDepositComponent,
    FixedDepositFormContainerComponent,
    FixedDepositListContainerComponent,
    FixedDepositFormComponent
  ],
  exports: [
    ...fixedDepositContainers.containers,
    ...fixedDepositComponents.components
  ]
})
export class FixedDepositModule {}

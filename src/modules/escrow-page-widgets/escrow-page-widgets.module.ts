/* tslint:disable: ordered-imports*/
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { NgSelectModule } from '@ng-select/ng-select';

/* Components */
import * as escrowPageWidgetsComponents from './components';

/* Containers */
import * as escrowPageWidgetsContainers from './containers';

/* Guards */
import * as escrowPageWidgetsGuards from './guards';

/* Services */
import * as escrowPageWidgetsServices from './services';
import { EscrowPageFieldDirective } from './directives/escrow-page-field.directive';
import {
  EscrowPageFieldAadhaarComponent,
  EscrowPageFieldEditModalComponent,
  EscrowPageFieldTextComponent
} from '@modules/escrow-page-widgets/components';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatSliderModule,
    DragDropModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppCommonModule,
    NavigationModule,
    NgSelectModule
  ],
  providers: [
    ...escrowPageWidgetsServices.services,
    ...escrowPageWidgetsGuards.guards
  ],
  declarations: [
    ...escrowPageWidgetsContainers.containers,
    ...escrowPageWidgetsComponents.components,
    EscrowPageFieldDirective,
    EscrowPageFieldEditModalComponent,
    EscrowPageFieldTextComponent,
    EscrowPageFieldAadhaarComponent
  ],
  exports: [
    ...escrowPageWidgetsContainers.containers,
    ...escrowPageWidgetsComponents.components
  ]
})
export class EscrowPageWidgetsModule {}

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
import * as splashScreenComponents from './components';

/* Containers */
import * as splashScreenContainers from './containers';

/* Guards */
import * as splashScreenGuards from './guards';

/* Services */
import * as splashScreenServices from './services';

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
  providers: [...splashScreenServices.services, ...splashScreenGuards.guards],
  declarations: [
    ...splashScreenContainers.containers,
    ...splashScreenComponents.components
  ],
  exports: [
    ...splashScreenContainers.containers,
    ...splashScreenComponents.components
  ]
})
export class SplashScreenModule {}

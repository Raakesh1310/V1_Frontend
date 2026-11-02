/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from '@modules/navigation/models';
import { SplashScreenDataModel } from '@modules/splash-screen/models/splash-screen-data.model';

/* Module */
import { SplashScreenModule } from './splash-screen.module';

/* Containers */
import * as splashScreenContainers from './containers';

/* Component */
import * as splashScreenComponents from './components';

/* Guards */
import * as splashScreenGuards from './guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [],
    component: splashScreenContainers.SplashScreenPageComponent,
    children: [
      {
        path: '',
        component: splashScreenComponents.SplashScreenLoadingComponent
      },
      {
        path: 'error',
        component: splashScreenComponents.SplashScreenErrorComponent
      }
    ]
  }
];

@NgModule({
  imports: [SplashScreenModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class SplashScreenRoutingModule {}

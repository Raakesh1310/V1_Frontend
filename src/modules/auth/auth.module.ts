/* tslint:disable: ordered-imports*/
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { RecaptchaModule } from 'ng-recaptcha';

/* Components */
import * as authComponents from './components';

/* Containers */
import * as authContainers from './containers';

/* Guards */
import * as authGuards from './guards';

/* Services */
import * as authServices from './services';
import * as appCommonServices from './../app-common/services';
import { environment } from 'environments/environment';
import { ProfileModule } from '@modules/profile/profile.module';

let captchaMdule: typeof RecaptchaModule[] = [];
if (!environment.captchaDisable) {
  captchaMdule = [RecaptchaModule];
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    AppCommonModule,
    NavigationModule,
    ProfileModule,
    ...captchaMdule
  ],
  providers: [
    ...authServices.services,
    ...authGuards.guards,
    ...appCommonServices.services
  ],
  declarations: [...authContainers.containers, ...authComponents.components],
  exports: [...authContainers.containers, ...authComponents.components]
})
export class AuthModule {}

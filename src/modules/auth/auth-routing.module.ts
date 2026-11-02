/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from '@modules/navigation/models';
import { environment } from '../../environments/environment';

/* Module */
import { AuthModule } from './auth.module';

/* Containers */
import * as authContainers from './containers';

/* Guards */
import * as authGuards from './guards';

/* Routes */
export const ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    canActivate: [],
    component: authContainers.LoginComponent,
    data: {
      title: 'Login - Castler'
    } as SBRouteData
  },

  {
    path: 'verify/email',
    canActivate: [],
    component: authContainers.LinkVerificationPageComponent,
    data: {
      title: 'Verify Email - Castler'
    } as SBRouteData
  },
  {
    path: 'forgot-password',
    canActivate: [],
    component: authContainers.ForgotPasswordComponent,
    data: {
      title: 'Forgot Password - Castler'
    } as SBRouteData
  },
  {
    path: 'forgot-password/:key',
    canActivate: [],
    component: authContainers.ForgotPasswordComponent,
    data: {
      title: 'Forgot Password - Castler'
    } as SBRouteData
  },
  {
    path: 'reset-password/:key',
    canActivate: [],
    component: authContainers.ResetPasswordComponent,
    data: {
      title: 'Reset Password - Castler'
    } as SBRouteData
  },
  {
    path: 'create-password/:key',
    canActivate: [],
    component: authContainers.CreatePasswordComponent,
    data: {
      title: 'Reset Password - Castler'
    } as SBRouteData
  },
  {
    path: 'email-verified',
    canActivate: [],
    component: authContainers.EmailVerifiedComponent,
    data: {
      title: 'Reset Password - Castler'
    } as SBRouteData
  },
  {
    path: 'login-social',
    canActivate: [],
    component: authContainers.LoginSocialComponent,
    data: {
      title: 'Login Social - Castler'
    } as SBRouteData
  },
  {
    path: 'register-social',
    canActivate: [],
    component: authContainers.RegisterSocialComponent,
    data: {
      title: 'Register Social - Castler'
    } as SBRouteData
  },
  {
    path: 'forgot-password-social',
    canActivate: [],
    component: authContainers.ForgotPasswordSocialComponent,
    data: {
      title: 'Forgot Password Social - Castler'
    } as SBRouteData
  },

  {
    path: 'multi-tenant-add-users',
    canActivate: [],
    component: authContainers.MultiTenantAddUsersComponent,
    data: {
      title: 'Multi-Tenant Add Users - Castler'
    } as SBRouteData
  },
  {
    path: 'org-create',
    canActivate: [],
    component: authContainers.OrgCreateComponent,
    data: {
      title: 'Org Create - Castler'
    } as SBRouteData
  },
  {
    path: 'org-join',
    canActivate: [],
    component: authContainers.OrgJoinComponent,
    data: {
      title: 'Org Join - Castler'
    } as SBRouteData
  }
];

/**
 * Append the Registration Routes
 * According to environment routes
 */

if (environment.enableRegistration) {
  ROUTES.push({
    path: 'register',
    canActivate: [],
    component: authContainers.MultiTenantSelectComponent,
    data: {
      title: 'Multi-Tenant Select - Castler'
    } as SBRouteData
  });

  ROUTES.push({
    path: 'register-enterprise',
    canActivate: [],
    component: authContainers.RegisterComponent,
    data: {
      title: 'Register - Castler'
    } as SBRouteData
  });

  ROUTES.push({
    path: 'register-individual',
    canActivate: [],
    component: authContainers.RegisterComponent,
    data: {
      title: 'Register - Castler'
    } as SBRouteData
  });
}

@NgModule({
  imports: [AuthModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}

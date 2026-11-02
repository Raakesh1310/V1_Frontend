import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '@modules/auth/services';
import { Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable()
export class NavigationGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Check if User is Logged IN
    if (!this.authService.isLoggedIn()) {
      console.log('User is not logged in, so redirecting to login page');
      // Redirect the user
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });

      // And disable the Navigation
      return of(false);
    } else {
      // check if merchant verified
      if (!this.authService.isMerchantVerified()) {
        console.log('User is not verified, so redirecting to profile section.');
        // Redirect the user
        this.router.navigate([environment.urlPortalPrefix + '/profile'], {
          queryParams: { returnUrl: state.url }
        });

        // And disable the Navigation
        return of(false);
      }
    }

    return of(true);
  }
}

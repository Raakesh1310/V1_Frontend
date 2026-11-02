
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '@modules/auth/services';
import { Observable, of } from 'rxjs';

@Injectable()
export class DashboardGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

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
    }

    // Return Ok
    return of(true);
  }
}

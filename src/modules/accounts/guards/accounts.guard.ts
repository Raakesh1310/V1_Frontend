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
export class AccountsGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Check if User is Logged IN
    if (!this.authService.isLoggedIn()) {
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

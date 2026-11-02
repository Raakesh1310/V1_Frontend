import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '@modules/auth/services';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';

@Injectable()
export class TransfersGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (
      this.authService.isSuperAdmin() &&
      !environment.adminEmail
        .split(',')
        .map(email => email.trim())
        .includes(this.authService.getEmail() as string)
    ) {
      console.log(
        ('User Not Allowed' + this.authService.getEmail()) as string
      );
      this.router.navigate(['/auth/login']);
      return of(false);
    } else {
      console.log(('User allowed ' + this.authService.getEmail()) as string);
      return of(true);
    }
  }
}

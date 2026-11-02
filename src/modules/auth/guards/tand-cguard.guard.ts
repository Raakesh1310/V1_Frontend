import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services';
import { TAndCStatusEnum } from '../models/tAndC.model';
@Injectable({
  providedIn: 'root',
})
export class TAndCGuardGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const tAndC = this.authService.getTAndC();
    if (tAndC?.status === TAndCStatusEnum.ACCEPTED) {
      return true;
    } else {
      return false;
    }
  }
}

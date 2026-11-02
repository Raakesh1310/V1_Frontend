import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';


export interface CanComponentDeactivate {
  confirm: () => Promise<boolean> | Observable<boolean>| boolean;
}

@Injectable()
export class DeactivateGuard implements CanDeactivate <CanComponentDeactivate> {

  constructor() {

  }

  canDeactivate(
    component: CanComponentDeactivate,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    // nextState : RouterStateSnapshot
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('challan_bool ', localStorage.getItem('challan_bool'));
    if(localStorage.getItem('challan_bool') === null) {
      return true;
    }
    if(localStorage.getItem('challan_bool') === 'true'){
      return true;
    }else{
      return confirm('Form will not be saved if you leave. Do you still want to exit?');
    }
  }
}

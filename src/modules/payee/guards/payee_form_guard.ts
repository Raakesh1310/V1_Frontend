import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';


export interface CanComponentDeactivate {
  confirm: () => Promise<boolean> | Observable<boolean>| boolean;
}

@Injectable()
export class Payee_form_guard implements CanDeactivate <CanComponentDeactivate> {

  constructor() {

  }

  canDeactivate(
    component: CanComponentDeactivate,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    // nextState : RouterStateSnapshot
  ): boolean | Promise<boolean> | Observable<boolean> {
    // console.log('payee_bool ', localStorage.getItem('payee_bool'));
    // if(localStorage.getItem('payee_bool') === null) {
    //   return true;
    // }
    // if(localStorage.getItem('payee_bool') === 'true'){
    //   return true;
    // }else{
    //   return confirm('Form will not be saved if you leave. Do you still want to exit?');
    // }
    return true;
  }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class SplashScreenService {
  constructor() {}

  getSplashScreen$(): Observable<{}> {
    return of({});
  }
}

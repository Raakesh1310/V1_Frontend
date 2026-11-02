import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TAndCStatusEnum } from '@modules/auth/models/tAndC.model';
import { AuthService } from '@modules/auth/services';
import { environment } from 'environments/environment';
import _ from 'lodash';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// // tslint:disable-next-line:no-any
// declare var _: any;

const tAndCRuleExceptionUrls = [
  new RegExp(`${environment.apiPrefix}/auth/*`),
  new RegExp(`${environment.apiPrefix}/tAndC/*`),
  new RegExp(`${environment.apiPrefix}/escrow-page/*`),
  new RegExp(`${environment.host}/escrow-page/*`)
];
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private route: Router) {}

  intercept(
    // tslint:disable-next-line:no-any
    req: HttpRequest<any>,
    next: HttpHandler
    // tslint:disable-next-line:no-any
  ): Observable<HttpEvent<any>> {
    // console.log('');
    // console.log('Interceptor triggered');
    // console.log('For Target Url => ' + req.url);
    // console.log('with token => ' + this.authService.getBearerToken());

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${this.authService.getBearerToken()}`,
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: 'Sat, 01 Jan 2000 00:00:00 GMT'
      }
    });
    // This interceptor will check if any one is trying to illegally trying to access the functionality.
    if (req.url) {
      const result = _.find(tAndCRuleExceptionUrls, reg => {
        return reg.test(req.url);
      });
      // tAndCRuleExceptionUrls.forEach(reg => {
      // const result = reg.test(req.url);
      if (!result) {
        const tAndC = this.authService.getTAndC();
        if (tAndC?.status !== TAndCStatusEnum.ACCEPTED) {
          throw new Error(
            'Cannot process request as terms and services are not accepted by the user.'
          );
        }
      }
      // });
    }
    // @ts-ignore
    return next.handle(req).pipe(
      // tslint:disable-next-line:no-any
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          event = event.clone({ body: this.modifyBody(event.body) });
        }

        return event;
      }),
      catchError(err => {
        if (err.status === 0) {
          // Network error found
          console.log('Network Error Found');
        } else if (err.status === 401 || err.status === 403) {
          // Unauthorized Access, token unidentified
          console.log('Logging Out');
          this.route.navigate(['/auth/login']).then(r => {});
        }
        console.error('Error in token interceptor');
        console.error(err);
        return throwError(err);
      })
      // tslint:disable-next-line:no-any
    );
  }

  // tslint:disable-next-line:no-any
  modifyBody(body: any) {
    try {
      if (!_.has(body, 'success')) {
        body.success = false;
      }
    } catch (e) {
      console.log(e);
    }
    return body;
  }
}

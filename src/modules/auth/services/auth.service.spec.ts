import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import StorageService from '@common/services/storage.service';
import { User } from '@modules/auth/models';
import { DashboardService } from '@modules/dashboard/services';
import { InvoicesModule } from '@modules/invoices/invoices.module';
import { MailModule } from '@modules/mail/mail.module';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService, AuthService, StorageService],
      imports: [
        HttpClientModule,
        InvoicesModule,
        MailModule,
        RouterTestingModule
      ]
    });
    authService = TestBed.inject(AuthService);
  });

  describe('Authentication service', () => {
    it('should login user and save data in storage', done => {
      authService
        .login({
          email: 'admin@castler.com',
          password: '12345678',
          otp: '3344'
        } as User)
        .subscribe(resp => {
          expect(resp).not.toBeUndefined();
          expect(resp.result).not.toBeUndefined();
          expect(resp.result.token).not.toBeUndefined();

          expect(authService.getBearerToken).not.toBeUndefined();

          done();
        });
    });
  });
});

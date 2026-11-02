import { Injectable } from '@angular/core';
import { AuthService } from '@modules/auth/services/auth.service';
import { Observable, ReplaySubject } from 'rxjs';

import { User } from '../models';

const userSubject: ReplaySubject<User> = new ReplaySubject(1);

@Injectable()
export class UserService {
  constructor(private authService: AuthService) {
    this.user = {
      isSuperAdmin: false,
      captchaToken: '',
      otp: '',
      role: '',
      id: '123',
      fullName: authService.getEmail() || '',
      lastName: '',
      firstName: '',
      email: authService.getEmail() || '',
      mobile: '9167969755',
      image: authService.getLogo() || '',
      token: '',
      password: '',
      confirmPassword: '',
      address: '',
      authorizedPerson: '',
      businessGst: '',
      businessName: '',
      businessPAN: '',
      pinCode: '',
      gAuthEnabled: false,
      gAuthSecret: '',
      totp: '',
      whatsapp: false
    };
  }

  set user(user: User) {
    userSubject.next(user);
  }

  get user$(): Observable<User> {
    return userSubject.asObservable();
  }
}

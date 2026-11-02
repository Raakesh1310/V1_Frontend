import { User } from '@modules/auth/models';
import { UserService } from '@modules/auth/services';
import { MockUser } from '@testing/mocks';
import { Observable, ReplaySubject } from 'rxjs';

const mockUser = new MockUser();
const _user$ = new ReplaySubject<User>(1);

export class UserServiceStub extends UserService {
  // constructor() {
  //   super(super);
  //   _user$.next(mockUser);
  // }
  set user(user: User) {}
  get user$(): Observable<User> {
    return _user$;
  }
}

import { TestBed } from '@angular/core/testing';

import { UsersGuard } from './users.guard';

describe('_Template Module Guards', () => {
  let usersGuard: UsersGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [UsersGuard]
    });
    usersGuard = TestBed.get(UsersGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      // usersGuard.canActivate().subscribe(response => {
      //   expect(response).toEqual(true);
      // });
    });
  });
});

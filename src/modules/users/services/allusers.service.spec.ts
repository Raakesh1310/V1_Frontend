import { TestBed } from '@angular/core/testing';

import { AllUsersService } from './allusers.service';

describe('UsersService', () => {
  let usersService: AllUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AllUsersService]
    });
    usersService = TestBed.inject(AllUsersService);
  });

  describe('getUsers$', () => {
    it('should return Observable<Users>', () => {
      // usersService.getUsers$().subscribe(response => {
      //   expect(response).toEqual({});
      // });
    });
  });
});

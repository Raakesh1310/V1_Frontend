import { TestBed } from '@angular/core/testing';

import { AllUsersService } from './all-users.service';

describe('AllUsersService', () => {
  let allUsersService: AllUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AllUsersService]
    });
    allUsersService = TestBed.get(AllUsersService);
  });

  // describe('getAllUsers$', () => {
  //   it('should return Observable<AllUsers>', () => {
  //     allUsersService.getAllUsers$().subscribe(response => {
  //       expect(response).toEqual({});
  //     });
  //   });
  // });
});

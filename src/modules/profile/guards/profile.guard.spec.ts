import { TestBed } from '@angular/core/testing';

import { ProfileGuard } from './profile.guard';

describe('_Template Module Guards', () => {
  let profileGuard: ProfileGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [ProfileGuard]
    });
    profileGuard = TestBed.get(ProfileGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      profileGuard.canActivate().subscribe(response => {
        expect(response).toEqual(true);
      });
    });
  });
});

import { TestBed } from '@angular/core/testing';

import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let profileService: ProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProfileService]
    });
    profileService = TestBed.get(ProfileService);
  });

  describe('getProfile$', () => {
    it('should return Observable<Profile>', () => {
      // profileService.getProfile().subscribe(response => {
      //   expect(response).toEqual({});
      // });
    });
  });
});

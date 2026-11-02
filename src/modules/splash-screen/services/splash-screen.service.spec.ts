import { TestBed } from '@angular/core/testing';

import { SplashScreenService } from './splash-screen.service';

describe('SplashScreenService', () => {
  let splashScreenService: SplashScreenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SplashScreenService]
    });
    splashScreenService = TestBed.get(SplashScreenService);
  });

  describe('getSplashScreen$', () => {
    it('should return Observable<SplashScreen>', () => {
      splashScreenService.getSplashScreen$().subscribe(response => {
        expect(response).toEqual({});
      });
    });
  });
});

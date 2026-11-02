import { TestBed } from '@angular/core/testing';

import { SplashScreenGuard } from './splash-screen.guard';

describe('_Template Module Guards', () => {
  let splashScreenGuard: SplashScreenGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [SplashScreenGuard]
    });
    splashScreenGuard = TestBed.get(SplashScreenGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      splashScreenGuard.canActivate().subscribe(response => {
        expect(response).toEqual(true);
      });
    });
  });
});

import { TestBed } from '@angular/core/testing';

import { TAndCGuardGuard } from './tand-cguard.guard';

describe('TAndCGuardGuard', () => {
  let guard: TAndCGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(TAndCGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

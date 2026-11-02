import { TestBed } from '@angular/core/testing';

import { FixedDepositGuard } from './fixed-deposit.guard';

describe('_Template Module Guards', () => {
  let fixedDepositGuard: FixedDepositGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [FixedDepositGuard]
    });
    fixedDepositGuard = TestBed.get(FixedDepositGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      fixedDepositGuard.canActivate().subscribe(response => {
        expect(response).toEqual(true);
      });
    });
  });
});

import { TestBed } from '@angular/core/testing';

import { FixedDepositService } from './fixed-deposit.service';

describe('FixedDepositService', () => {
  let fixedDepositService: FixedDepositService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FixedDepositService]
    });
    fixedDepositService = TestBed.get(FixedDepositService);
  });

  describe('getFixedDeposit$', () => {
    it('should return Observable<FixedDeposit>', () => {
      fixedDepositService.getFixedDeposit$().subscribe(response => {
        expect(response).toEqual({});
      });
    });
  });
});

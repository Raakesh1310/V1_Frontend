import { TestBed } from '@angular/core/testing';

import { TransactionsGuard } from './transactions.guard';

describe('_Template Module Guards', () => {
  let transactionsGuard: TransactionsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [TransactionsGuard]
    });
    transactionsGuard = TestBed.get(TransactionsGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      transactionsGuard.canActivate().subscribe(response => {
        expect(response).toEqual(true);
      });
    });
  });
});

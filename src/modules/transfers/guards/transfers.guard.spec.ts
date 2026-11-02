import { TestBed } from '@angular/core/testing';

import { TransfersGuard } from './transfers.guard';

describe('_Template Module Guards', () => {
  let transfersGuard: TransfersGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [TransfersGuard]
    });
    transfersGuard = TestBed.get(TransfersGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      transfersGuard.canActivate().subscribe(response => {
        expect(response).toEqual(true);
      });
    });
  });
});

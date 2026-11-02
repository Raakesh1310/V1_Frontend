import { TestBed } from '@angular/core/testing';

import { EscrowPagesGuard } from './escrow-pages.guard';

describe('_Template Module Guards', () => {
  let escrowPagesGuard: EscrowPagesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [EscrowPagesGuard]
    });
    escrowPagesGuard = TestBed.get(EscrowPagesGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      escrowPagesGuard.canActivate().subscribe(response => {
        expect(response).toEqual(true);
      });
    });
  });
});

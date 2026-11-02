import { TestBed } from '@angular/core/testing';

import { EscrowPageWidgetsGuard } from './escrow-page-widgets.guard';

describe('_Template Module Guards', () => {
  let escrowPageWidgetsGuard: EscrowPageWidgetsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [EscrowPageWidgetsGuard]
    });
    escrowPageWidgetsGuard = TestBed.get(EscrowPageWidgetsGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      escrowPageWidgetsGuard.canActivate().subscribe(response => {
        expect(response).toEqual(true);
      });
    });
  });
});

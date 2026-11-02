import { TestBed } from '@angular/core/testing';

import { DealGuard } from './deal.guard';

describe('_Template Module Guards', () => {
  let dealGuard: DealGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [DealGuard]
    });
    dealGuard = TestBed.get(DealGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      dealGuard.canActivate().subscribe(response => {
        expect(response).toEqual(true);
      });
    });
  });
});

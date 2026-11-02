import { TestBed } from '@angular/core/testing';

import { MerchantGuard } from './merchant.guard';

describe('_Template Module Guards', () => {
  let merchantGuard: MerchantGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [MerchantGuard]
    });
    merchantGuard = TestBed.get(MerchantGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      merchantGuard.canActivate().subscribe(response => {
        expect(response).toEqual(true);
      });
    });
  });
});

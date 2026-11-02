import { TestBed } from '@angular/core/testing';

import { MerchantService } from './merchant.service';

describe('MerchantService', () => {
  let merchantService: MerchantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MerchantService]
    });
    merchantService = TestBed.get(MerchantService);
  });

  describe('getMerchant$', () => {
    it('should return Observable<Merchant>', () => {
      // merchantService.getMerchant$().subscribe(response => {
      //   expect(response).toEqual({});
      // });
    });
  });
});

import { TestBed } from '@angular/core/testing';

import { DealService } from './deal.service';

describe('DealService', () => {
  let dealService: DealService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DealService]
    });
    dealService = TestBed.get(DealService);
  });

  describe('getDeal$', () => {
    it('should return Observable<Deal>', () => {
      dealService.getDeal$().subscribe(response => {
        expect(response).toEqual({});
      });
    });
  });
});

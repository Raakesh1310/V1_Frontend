import { TestBed } from '@angular/core/testing';

import { ChallanService } from './challan.service';

describe('ChallanService', () => {
  let challanService: ChallanService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChallanService]
    });
    challanService = TestBed.inject(ChallanService);
  });

  describe('getChallan$', () => {
    it('should return Observable<ChallanModel>', () => {
      // challanService.getChallan$().subscribe(response => {
      //   expect(response).toEqual([]);
      // });
    });
  });
});

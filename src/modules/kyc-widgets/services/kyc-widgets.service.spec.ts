import { TestBed } from '@angular/core/testing';

import { KycWidgetsService } from './kyc-widgets.service';

describe('KycWidgetsService', () => {
  let kycWidgetsService: KycWidgetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KycWidgetsService]
    });
    kycWidgetsService = TestBed.get(KycWidgetsService);
  });

  // describe('getKycWidgets$', () => {
  //   it('should return Observable<KycWidgets>', () => {
  //     kycWidgetsService.getKycWidgets$().subscribe(response => {
  //       expect(response).toEqual({});
  //     });
  //   });
  // });
});

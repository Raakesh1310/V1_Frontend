import { TestBed } from '@angular/core/testing';

import { PassbookService } from './passbook.service';

describe('PassbookService', () => {
  let passbookService: PassbookService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PassbookService]
    });
    passbookService = TestBed.get(PassbookService);
  });

  describe('getPassbook$', () => {
    it('should return Observable<Passbook>', () => {
      // passbookService.getPassbook$().subscribe(response => {
      //   expect(response).toEqual({});
      // });
    });
  });
});

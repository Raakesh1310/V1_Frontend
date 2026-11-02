import { TestBed } from '@angular/core/testing';

import { PayeeService } from './payee.service';

describe('PayeeService', () => {
  let payeeService: PayeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PayeeService]
    });
    payeeService = TestBed.get(PayeeService);
  });

  describe('getPayee$', () => {
    it('should return Observable<Payee>', () => {
      // payeeService.getPayee$().subscribe(response => {
      //   expect(response).toEqual({});
      // });
    });
  });
});

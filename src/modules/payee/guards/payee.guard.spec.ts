import { TestBed } from '@angular/core/testing';

import { PayeeGuard } from './payee.guard';

describe('_Template Module Guards', () => {
  let payeeGuard: PayeeGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [PayeeGuard]
    });
    payeeGuard = TestBed.get(PayeeGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      // payeeGuard.canActivate().subscribe(response => {
      //   expect(response).toEqual(true);
      // });
    });
  });
});

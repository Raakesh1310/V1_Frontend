import { TestBed } from '@angular/core/testing';

import { PassbookGuard } from './passbook.guard';

describe('_Template Module Guards', () => {
  let passbookGuard: PassbookGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [PassbookGuard]
    });
    passbookGuard = TestBed.get(PassbookGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      passbookGuard.canActivate().subscribe(response => {
        expect(response).toEqual(true);
      });
    });
  });
});

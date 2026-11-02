import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AccountsGuard } from './accounts.guard';

describe('_Template Module Guards', () => {
  let accountsGuard: AccountsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [AccountsGuard]
    });
    accountsGuard = TestBed.get(AccountsGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      accountsGuard
        .canActivate(new ActivatedRouteSnapshot(), {
          url: 'testUrl'
        } as RouterStateSnapshot)
        .subscribe(response => {
          expect(response).toEqual(true);
        });
    });
  });
});

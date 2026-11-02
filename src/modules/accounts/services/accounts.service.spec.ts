import { TestBed } from '@angular/core/testing';

import { AccountsService } from './accounts.service';

describe('AccountsService', () => {
  let accountsService: AccountsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountsService]
    });
    accountsService = TestBed.get(AccountsService);
  });

  describe('getAccounts$', () => {
    it('should return Observable<Accounts>', () => {
      // accountsService.getAccounts$().subscribe(response => {
      //   expect(response).toEqual({});
      // });
    });
  });
});

import { TestBed } from '@angular/core/testing';

import { BankStatementsService } from './bank-statements.service';

describe('BankStatementsService', () => {
  let service: BankStatementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BankStatementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

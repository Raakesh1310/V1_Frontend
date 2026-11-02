import { DecimalPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
  let transactionService: TransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransactionService, DecimalPipe]
    });
    transactionService = TestBed.inject(TransactionService);
  });

  it('should get transaction$', () => {
    transactionService.transaction$.subscribe(response => {
      expect(response).toBeDefined();
    });
  });
  it('should get total$', () => {
    transactionService.total$.subscribe(response => {
      expect(response).toBeDefined();
    });
  });
  it('should get loading$', () => {
    transactionService.loading$.subscribe(response => {
      expect(response).toBeDefined();
    });
  });
  it('should set page', () => {
    transactionService.page = 3;
    expect(transactionService.page).toBe(3);
  });
  it('should set pageSize', () => {
    transactionService.pageSize = 3;
    expect(transactionService.pageSize).toBe(3);
  });
  it('should set SearchTerm', () => {
    transactionService.searchTerm = 'TEST';
    expect(transactionService.searchTerm).toBe('TEST');
  });
  it('should sort ascending', done => {
    transactionService.sortColumn = 'date';
    transactionService.sortDirection = 'asc';
    // transactionService.transaction$.subscribe(transaction => {
    //   if (transaction.length === 0) {
    //     return;
    //   }
    //   expect(transaction[0].date).toBe('01/10/20');
    //   done();
    // });
  });
  it('should sort descending', done => {
    transactionService.sortColumn = 'time';
    transactionService.sortDirection = 'desc';
    transactionService.transaction$.subscribe(transaction => {
      if (transaction.length === 0) {
        return;
      }
      expect(transaction[0].time).toBe('5:45 AM');
      done();
    });
  });
});

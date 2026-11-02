import { TestBed } from '@angular/core/testing';

import { TransfersAdminService } from './transferAdmin.service';
import { TransfersService } from './transfers.service';

describe('TransfersService', () => {
  let transfersService: TransfersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransfersService, TransfersAdminService]
    });
    transfersService = TestBed.get(TransfersService);
  });

  describe('getTransfers$', () => {
    it('should return Observable<Transfers>', () => {
      transfersService.getTransfers$().subscribe(response => {
        expect(response).toEqual({});
      });
    });
  });
});

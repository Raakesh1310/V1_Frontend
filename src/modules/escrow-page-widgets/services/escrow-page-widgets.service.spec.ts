import { TestBed } from '@angular/core/testing';

import { EscrowPageWidgetsService } from './escrow-page-widgets.service';

describe('EscrowPageWidgetsService', () => {
  let escrowPageWidgetsService: EscrowPageWidgetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EscrowPageWidgetsService]
    });
    escrowPageWidgetsService = TestBed.get(EscrowPageWidgetsService);
  });

  describe('getEscrowPageWidgets$', () => {
    it('should return Observable<EscrowPageWidgets>', () => {
      escrowPageWidgetsService.getEscrowPageWidgets$().subscribe(response => {
        expect(response).toEqual({});
      });
    });
  });
});

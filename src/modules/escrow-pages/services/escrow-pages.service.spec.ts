import { TestBed } from '@angular/core/testing';

import { EscrowPagesService } from './escrow-pages.service';

describe('EscrowPagesService', () => {
  let escrowPagesService: EscrowPagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EscrowPagesService]
    });
    escrowPagesService = TestBed.get(EscrowPagesService);
  });

  describe('getEscrowPages$', () => {
    it('should return Observable<EscrowPages>', () => {
      escrowPagesService.getEscrowPages$().subscribe(response => {
        expect(response).toEqual({});
      });
    });
  });
});

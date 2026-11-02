import { TestBed } from '@angular/core/testing';

import { EscrowQrService } from './escrow-qr.service';

describe('EscrowQrService', () => {
    let escrowQrService: EscrowQrService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [EscrowQrService],
        });
        escrowQrService = TestBed.get(EscrowQrService);
    });

    describe('getEscrowQr$', () => {
        it('should return Observable<EscrowQr>', () => {
            escrowQrService.getEscrowQr$().subscribe(response => {
                expect(response).toEqual({});
            });
        });
    });
});

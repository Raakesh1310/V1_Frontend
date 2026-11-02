import { TestBed } from '@angular/core/testing';

import { EscrowQrGuard } from './escrow-qr.guard';

describe('_Template Module Guards', () => {
    let escrowQrGuard: EscrowQrGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [EscrowQrGuard],
        });
        escrowQrGuard = TestBed.get(EscrowQrGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            escrowQrGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });

});

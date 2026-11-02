import { TestBed } from '@angular/core/testing';

import { KycWidgetsGuard } from './kyc-widgets.guard';

describe('_Template Module Guards', () => {
    let kycWidgetsGuard: KycWidgetsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [KycWidgetsGuard],
        });
        kycWidgetsGuard = TestBed.get(KycWidgetsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            kycWidgetsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });

});

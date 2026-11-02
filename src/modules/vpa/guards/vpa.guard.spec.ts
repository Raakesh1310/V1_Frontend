import { TestBed } from '@angular/core/testing';

import { VpaGuard } from './vpa.guard';

describe('_Template Module Guards', () => {
    let vpaGuard: VpaGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [VpaGuard],
        });
        vpaGuard = TestBed.get(VpaGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            vpaGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });

});

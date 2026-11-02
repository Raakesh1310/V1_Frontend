import { TestBed } from '@angular/core/testing';

import { PartiesGuard } from './parties.guard';

describe('_Template Module Guards', () => {
    let partiesGuard: PartiesGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [PartiesGuard],
        });
        partiesGuard = TestBed.get(PartiesGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            partiesGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });

});

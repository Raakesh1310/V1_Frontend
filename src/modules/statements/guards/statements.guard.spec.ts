import { TestBed } from '@angular/core/testing';

import { StatementsGuard } from './statements.guard';

describe('_Template Module Guards', () => {
    let statementsGuard: StatementsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [StatementsGuard],
        });
        statementsGuard = TestBed.get(StatementsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            statementsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });

});

import { TestBed } from '@angular/core/testing';

import { ApprovalsGuard } from './approvals.guard';

describe('_Template Module Guards', () => {
    let approvalsGuard: ApprovalsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [ApprovalsGuard],
        });
        approvalsGuard = TestBed.get(ApprovalsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            approvalsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });

});

import { TestBed } from '@angular/core/testing';

import { AllUsersGuard } from './all-users.guard';

describe('_Template Module Guards', () => {
    let allUsersGuard: AllUsersGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [AllUsersGuard],
        });
        allUsersGuard = TestBed.get(AllUsersGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            allUsersGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });

});

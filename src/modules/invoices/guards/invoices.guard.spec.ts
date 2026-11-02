import { TestBed } from '@angular/core/testing';

import { InvoicesGuard } from './invoices.guard';

describe('_Template Module Guards', () => {
    let invoicesGuard: InvoicesGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [InvoicesGuard],
        });
        invoicesGuard = TestBed.get(InvoicesGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            invoicesGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });

});

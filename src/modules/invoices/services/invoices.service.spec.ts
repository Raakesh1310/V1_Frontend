import { TestBed } from '@angular/core/testing';

import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
    let invoicesService: InvoicesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [InvoicesService],
        });
        invoicesService = TestBed.get(InvoicesService);
    });

    describe('getInvoices$', () => {
        it('should return Observable<Invoices>', () => {
            invoicesService.getInvoices$().subscribe(response => {
                expect(response).toEqual({});
            });
        });
    });
});

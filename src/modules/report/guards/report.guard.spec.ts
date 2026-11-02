import { TestBed } from '@angular/core/testing';

import { ReportGuard } from './report.guard';

describe('_Template Module Guards', () => {
    let reportGuard: ReportGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [ReportGuard],
        });
        reportGuard = TestBed.get(ReportGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            reportGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });

});

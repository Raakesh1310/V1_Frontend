import { TestBed } from '@angular/core/testing';

import { ReportService } from './report.service';

describe('ReportService', () => {
    let reportService: ReportService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ReportService],
        });
        reportService = TestBed.get(ReportService);
    });

    describe('getReport$', () => {
        it('should return Observable<Report>', () => {
            reportService.getReport$().subscribe(response => {
                expect(response).toEqual({});
            });
        });
    });
});

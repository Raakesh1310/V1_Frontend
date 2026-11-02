import { TestBed } from '@angular/core/testing';

import { ActivityLogsGuard } from './activity-logs.guard';

describe('_Template Module Guards', () => {
    let activityLogsGuard: ActivityLogsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [ActivityLogsGuard],
        });
        activityLogsGuard = TestBed.get(ActivityLogsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            activityLogsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });

});

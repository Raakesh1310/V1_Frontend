import { TestBed } from '@angular/core/testing';

import { ActivityLogsService } from './activity-logs.service';

describe('ActivityLogsService', () => {
  let activityLogsService: ActivityLogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActivityLogsService]
    });
    activityLogsService = TestBed.get(ActivityLogsService);
  });

  // describe('getActivityLogs$', () => {
  //   it('should return Observable<ActivityLogs>', () => {
  //     activityLogsService.getActivityLogs$().subscribe(response => {
  //       expect(response).toEqual({});
  //     });
  //   });
  // });
});

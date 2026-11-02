import { TestBed } from '@angular/core/testing';

import { MilestoneService } from './milestone.service';

describe('MilestonesService', () => {
  let milestonesService: MilestoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MilestoneService]
    });
    milestonesService = TestBed.get(MilestoneService);
  });

  describe('getMilestones$', () => {
    it('should return Observable<Milestones>', () => {
      // milestonesService.getMilestones$().subscribe(response => {
      //   expect(response).toEqual({});
      // });
    });
  });
});

import { TestBed } from '@angular/core/testing';

import { MilestoneGuard } from './milestone.guard';

describe('_Template Module Guards', () => {
  let milestonesGuard: MilestoneGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [MilestoneGuard]
    });
    milestonesGuard = TestBed.get(MilestoneGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      // milestonesGuard.canActivate().subscribe(response => {
      //   expect(response).toEqual(true);
      // });
    });
  });
});

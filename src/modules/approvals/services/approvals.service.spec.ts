import { TestBed } from '@angular/core/testing';

import { ApprovalsService } from './approvals.service';

describe('ApprovalsService', () => {
  let approvalsService: ApprovalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApprovalsService]
    });
    approvalsService = TestBed.get(ApprovalsService);
  });

  // describe('getApprovals$', () => {
  //   it('should return Observable<Approvals>', () => {
  //     approvalsService.getApprovals$().subscribe(response => {
  //       expect(response).toEqual({});
  //     });
  //   });
  // });
});

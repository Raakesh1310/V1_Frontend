import { TestBed } from '@angular/core/testing';

import { helpdeskGuard } from './helpdesk.guard';

describe('_Template Module Guards', () => {
  let helpdeskGuard: helpdeskGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [helpdeskGuard]
    });
    helpdeskGuard = TestBed.get(helpdeskGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      helpdeskGuard.canActivate().subscribe(response => {
        expect(response).toEqual(true);
      });
    });
  });
});

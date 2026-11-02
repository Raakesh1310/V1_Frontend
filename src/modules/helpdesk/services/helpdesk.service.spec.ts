import { TestBed } from '@angular/core/testing';

import { helpdeskService } from './helpdesk.service';

describe('helpdeskService', () => {
  let helpdeskService: helpdeskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [helpdeskService]
    });
    helpdeskService = TestBed.get(helpdeskService);
  });

  describe('gethelpdesk$', () => {
    it('should return Observable<helpdesk>', () => {
      // helpdeskService.gethelpdesk$().subscribe(response => {
      //   expect(response).toEqual({});
      // });
    });
  });
});

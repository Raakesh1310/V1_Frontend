import { TestBed } from '@angular/core/testing';

import { StatementsService } from './statements.service';

describe('StatementsService', () => {
  let statementsService: StatementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StatementsService]
    });
    statementsService = TestBed.get(StatementsService);
  });

  // describe('getStatements$', () => {
  //   it('should return Observable<Statements>', () => {
  //     statementsService.getStatements$().subscribe(response => {
  //       expect(response).toEqual({});
  //     });
  //   });
  // });
});

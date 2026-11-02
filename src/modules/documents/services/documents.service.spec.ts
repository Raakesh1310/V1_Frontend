import { TestBed } from '@angular/core/testing';

import { DocumentsService } from './documents.service';

describe('DocumentsService', () => {
  let documentsService: DocumentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DocumentsService]
    });
    documentsService = TestBed.get(DocumentsService);
  });

  describe('getDocuments$', () => {
    it('should return Observable<Documents>', () => {
      // documentsService.getDocuments$().subscribe(response => {
      //   expect(response).toEqual({});
      // });
    });
  });
});

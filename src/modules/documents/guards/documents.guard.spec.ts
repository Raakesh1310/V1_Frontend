import { TestBed } from '@angular/core/testing';

import { DocumentsGuard } from './documents.guard';

describe('_Template Module Guards', () => {
  let documentsGuard: DocumentsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [DocumentsGuard]
    });
    documentsGuard = TestBed.get(DocumentsGuard);
  });

  describe('canActivate', () => {
    it('should return an Observable<boolean>', () => {
      documentsGuard.canActivate().subscribe(response => {
        expect(response).toEqual(true);
      });
    });
  });
});

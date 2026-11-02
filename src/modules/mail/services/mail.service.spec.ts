import { TestBed } from '@angular/core/testing';

import { MailService } from './mail.service';

describe('MailService', () => {
  let mailService: MailService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MailService]
    });
    mailService = TestBed.get(MailService);
  });

  // describe('getMail$', () => {
  //   it('should return Observable<Mail>', () => {
  //     mailService.getMail$().subscribe(response => {
  //       expect(response).toEqual({});
  //     });
  //   });
  // });
});

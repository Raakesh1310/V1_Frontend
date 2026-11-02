import { TestBed } from '@angular/core/testing';

import { MailGuard } from './mail.guard';

describe('_Template Module Guards', () => {
    let mailGuard: MailGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [MailGuard],
        });
        mailGuard = TestBed.get(MailGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            mailGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });

});

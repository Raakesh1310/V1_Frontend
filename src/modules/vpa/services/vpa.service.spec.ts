import { TestBed } from '@angular/core/testing';

import { VpaService } from './vpa.service';

describe('VpaService', () => {
    let vpaService: VpaService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [VpaService],
        });
        vpaService = TestBed.get(VpaService);
    });

    describe('getVpa$', () => {
        it('should return Observable<Vpa>', () => {
            vpaService.getVpa$().subscribe(response => {
                expect(response).toEqual({});
            });
        });
    });
});

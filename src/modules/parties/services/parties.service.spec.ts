import { TestBed } from '@angular/core/testing';

import { PartiesService } from './parties.service';

describe('PartiesService', () => {
    let partiesService: PartiesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PartiesService],
        });
        partiesService = TestBed.get(PartiesService);
    });

    describe('getParties$', () => {
        it('should return Observable<Parties>', () => {
            partiesService.getParties$().subscribe(response => {
                expect(response).toEqual({});
            });
        });
    });
});

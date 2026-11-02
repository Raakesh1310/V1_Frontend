import { TestBed } from '@angular/core/testing';

import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
    let notificationsService: NotificationsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NotificationsService],
        });
        notificationsService = TestBed.get(NotificationsService);
    });

    describe('getNotifications$', () => {
        it('should return Observable<Notifications>', () => {
            notificationsService.getNotifications$().subscribe(response => {
                expect(response).toEqual({});
            });
        });
    });
});

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilityService } from '@common/services';
import { AuthService } from '@modules/auth/services';
import { environment } from 'environments/environment';
import moment from 'moment';

import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NotificationsService {
  page = 1;

  private _notifications$!: BehaviorSubject<any>;

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private utilityService: UtilityService
  ) {}

  get notification$() {
    return this._notifications$.asObservable();
  }

  addNotification(portalNotificationData: object) {
    const url = environment.apiPrefix + '/super-admin/portal-notifications';
    return this.httpClient.post(url, portalNotificationData);
  }

  changePage(page: number) {
    this.page = page;
    return this.getAllNotifications();
  }

  getAllNotifications() {
    const url =
      environment.apiPrefix +
      `/super-admin/portal-notifications?page=${
        this.page
      }&dateTo=${null}&dateFrom=${null}`;
    return this.httpClient.get(url);
  }

  findOne(dateFrom: Date, dateTo: Date) {
    let url;

    const _dateFrom = new Date(
      `${dateFrom.getFullYear()}/${dateFrom.getMonth() +
        1}/${dateFrom.getDate()}`
    );

    const _dateTo = moment(
      new Date(
        `${dateTo.getFullYear()}/${dateTo.getMonth() + 1}/${dateTo.getDate()}`
      )
    )
      .add(24, 'h')
      .subtract(1, 'm')
      .toDate();

    if (this.authService.isSuperAdmin()) {
      url =
        environment.apiPrefix +
        `/super-admin/portal-notifications?page=${null}&dateTo=${_dateTo.toISOString()}&dateFrom=${_dateFrom.toISOString()}`;
    } else {
      url =
        environment.apiPrefix +
        `/portal-notifications?page=${null}&dateTo=${_dateTo.toISOString()}&dateFrom=${_dateFrom.toISOString()}`;
    }

    return this.httpClient.get(url);
  }

  deleteNotification(_id: string) {
    const url =
      environment.apiPrefix + `/super-admin/portal-notifications/${_id}`;

    return this.httpClient.delete(url);
  }
}

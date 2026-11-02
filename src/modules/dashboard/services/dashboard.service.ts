import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiResponseModel } from '@common/models/base-api-response.model';
import DashboardFiguresInterface from '@modules/dashboard/interfaces/dashboard-figures.interface';
import DashboardFiltersInterface from '@modules/dashboard/interfaces/dashboard-filters.interface';
import { DateObj, Dates, DayWiseStruct } from '@modules/dashboard/models';
import {
  DashboardResponseModel,
  DashboardTopResponseModel
} from '@modules/dashboard/models/dashboard-response.model';
import moment from 'moment';
import { Subject, throwError } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

interface DashboardEscrowAccounts {
  accountName: string;
  accountBalance: number;
}

@Injectable()
export class DashboardService {
  constructor(private httpClient: HttpClient) {}

  public static MODULES = {
    INWARD_TRANSACTION: 'inward-transaction',
    OUTWARD_TRANSACTION: 'outward-transaction',
    MERCHANT: 'merchant',
    ESCROW: 'escrow',
    ACCOUNTS: 'accounts'
  };

  public static SECTIONS = {
    COUNT: 'count',
    BALANCE: 'balance',
    ACCOUNTS: 'accounts',
    TOTAL_AMOUNT: 'total-amount',
    BILLING_AMOUNT: 'billing-amount',
    AVERAGE_DAILY_AMOUNT: 'average-daily-amount',
    AVERAGE_DAILY_BALANCE: 'average-daily-balance',
    BLOCKED_FUNDS: 'blocked-funds'
  };

  public dashData: any;

  dynamicData: Subject<DashboardResponseModel> = new Subject();

  fetchDashboardAccounts(
    dashboardFilters: Partial<DashboardFiltersInterface>,
    sort: Record<string, unknown>
  ): Observable<BaseApiResponseModel & { result: DashboardEscrowAccounts[] }> {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // tslint:disable-next-line:no-any
    const params = {} as any;

    if (dashboardFilters) {
      if (dashboardFilters.bankNames) {
        params.bankNames = JSON.stringify(
          dashboardFilters.bankNames
        ).toLowerCase();
      }
      if (dashboardFilters.statuses) {
        params.bankNames = JSON.stringify(dashboardFilters.statuses);
      }
      if (dashboardFilters.startDate) {
        params.startDate = dashboardFilters.startDate.toDateString();
      }
      if (dashboardFilters.endDate) {
        params.endDate = dashboardFilters.endDate.toDateString();
      }
      if (dashboardFilters.endDate) {
        params.endDate = dashboardFilters.endDate.toDateString();
      }
    }

    return this.httpClient.get<
      BaseApiResponseModel & { result: DashboardEscrowAccounts[] }
    >(environment.apiPrefix + `/dashboard/escrow/accounts`, {
      params,
      headers: httpHeaders
    });
  }

  fetchDashboardFigure(
    module: string,
    section: string,
    dashboardFilters: Partial<DashboardFiltersInterface> = {} as Partial<
      DashboardFiltersInterface
    >
  ) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // tslint:disable-next-line:no-any
    const params = {} as any;

    if (dashboardFilters) {
      if (dashboardFilters.bankNames) {
        params.bankNames = JSON.stringify(
          dashboardFilters.bankNames
        ).toLowerCase();
      }
      if (dashboardFilters.statuses) {
        params.statuses = JSON.stringify(dashboardFilters.statuses);
      }
      if (dashboardFilters.startDate) {
        params.startDate = dashboardFilters.startDate.toISOString();
      }
      if (dashboardFilters.endDate) {
        params.endDate = dashboardFilters.endDate.toISOString();
      }
      if (dashboardFilters.verified) {
        params.verified = dashboardFilters.verified;
      }
      if (dashboardFilters.status) {
        params.status = dashboardFilters.status;
      }
    }

    return this.httpClient.get<BaseApiResponseModel & { result: number }>(
      environment.apiPrefix + `/dashboard/${module}/${section}`,
      { params, headers: httpHeaders }
    );
  }

  fetchDashboardDayWiseData(
    section: string,
    dashboardFilters: Partial<
      DashboardFiltersInterface
    > = {} as DashboardFiltersInterface
  ) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // tslint:disable-next-line:no-any
    const params = {} as any;
    let url = environment.apiPrefix + `/dashboard/month-wise-report/${section}`;

    if (dashboardFilters.connectedBanking) {
      url =
        environment.apiPrefix + `/dashboard/month-wise-report-cb/${section}`;
    }

    if (dashboardFilters) {
      if (dashboardFilters.bankNames) {
        params.bankNames = JSON.stringify(
          dashboardFilters.bankNames
        ).toLowerCase();
      }
      if (dashboardFilters.statuses) {
        params.statuses = JSON.stringify(dashboardFilters.statuses);
      }
      if (dashboardFilters.startDate) {
        params.startDate = dashboardFilters.startDate.toISOString();
      }
      if (dashboardFilters.endDate) {
        params.endDate = dashboardFilters.endDate.toISOString();
      }

      if (dashboardFilters.endDate && dashboardFilters.startDate) {
        const daysDiff = Math.round(
          (dashboardFilters.endDate.getTime() -
            dashboardFilters.startDate.getTime()) /
            (1000 * 3600 * 24)
        );

        if (
          daysDiff < environment.noOfDaysSwitch &&
          !dashboardFilters.connectedBanking
        ) {
          url = environment.apiPrefix + `/dashboard/day-wise-report/${section}`;
        }

        if (
          daysDiff < environment.noOfDaysSwitch &&
          dashboardFilters.connectedBanking
        ) {
          url =
            environment.apiPrefix + `/dashboard/day-wise-report-cb/${section}`;
        }
      }
    }

    return this.httpClient
      .get<BaseApiResponseModel & { result: DayWiseStruct[] }>(url, {
        params,
        headers: httpHeaders
      })
      .pipe(
        map(resp => {
          // Handle the blank response
          // Here what we do that mocking the sample response
          if (!resp.result || resp.result.length === 0) {
            resp.result = [];
            let currentDay = moment(new Date()).subtract(1, 'day');

            for (let i = 1; i <= 7; i++) {
              resp.result.push({
                id: {
                  day: currentDay.date(),
                  month: currentDay.month() + 1,
                  year: currentDay.year()
                } as DateObj,
                amount: 0,
                count: 0
              } as DayWiseStruct);

              currentDay = currentDay.subtract(1, 'days');
            }

            resp.result = resp.result.reverse();
          }

          return resp;
        }),
        catchError(err => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  fetchFigures(
    dashboardFilters: Partial<
      DashboardFiltersInterface
    > = {} as DashboardFiltersInterface,
    project = [] as (keyof DashboardFiguresInterface)[]
  ) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // tslint:disable-next-line:no-any
    const params = {} as any;

    if (dashboardFilters) {
      if (dashboardFilters.bankNames) {
        params.bankNames = JSON.stringify(
          dashboardFilters.bankNames
        ).toLowerCase();
      }
      if (dashboardFilters.statuses) {
        params.statuses = JSON.stringify(dashboardFilters.statuses);
      }
      if (dashboardFilters.startDate) {
        params.startDate = dashboardFilters.startDate.toISOString();
      }
      if (dashboardFilters.endDate) {
        params.endDate = dashboardFilters.endDate.toISOString();
      }
      if (project.length > 0) {
        params.project = project;
      }
    }
    let url = environment.apiPrefix + `/dashboard/merchant/figures`;
    if (dashboardFilters.connectedBanking) {
      url = environment.apiPrefix + `/dashboard/merchant/figures-cb`;
    }
    return this.httpClient.get<
      BaseApiResponseModel & { result: DashboardFiguresInterface }
    >(url, {
      params,
      headers: httpHeaders
    });
  }

  fetchDashboardData(dateObject: Dates, bankNames: string[]) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = { bankName: JSON.stringify(bankNames).toLowerCase() };
    // console.log("DATE OBJECT ",dateObject);
    const stringify = JSON.stringify(dateObject);
    return this.httpClient.get<DashboardResponseModel>(
      environment.apiPrefix + `/dashboard/${stringify}`,
      { params, headers: httpHeaders }
    );
  }

  /**
   * Fetch Dashboard
   * Top Data
   * @param dateObject
   * @param bankNames
   */
  fetchDashboardTopData(dateObject: Dates, bankNames: string[]) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = { bankName: JSON.stringify(bankNames).toLowerCase() };
    // console.log("DATE OBJECT ",dateObject);
    const stringify = JSON.stringify(dateObject);
    return this.httpClient.get<DashboardTopResponseModel>(
      environment.apiPrefix + `/dashboard/top/${stringify}`,
      { params, headers: httpHeaders }
    );
  }

  fetchInvites() {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.get(
      environment.apiPrefix + '/user/merchant/invitation',
      {
        headers: httpHeaders
      }
    );
  }

  cancelInvite(invite: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.get(
      environment.apiPrefix + `/user/merchant/invitation/reject/${invite}`,
      {
        headers: httpHeaders
      }
    );
  }

  acceptInvite(invite: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.httpClient.get(
      environment.apiPrefix + `/user/merchant/invitation/accept/${invite}`,
      {
        headers: httpHeaders
      }
    );
  }

  fetchDashboardDataDynamically(dateObject: Dates) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const stringify = JSON.stringify(dateObject);
    return this.httpClient
      .get<DashboardResponseModel>(
        environment.apiPrefix + `/dashboard/${stringify}`,
        {
          headers: httpHeaders
        }
      )
      .pipe(
        map(resp => {
          console.log('DATA FROM DYNAMIC API ', resp);
          if (resp.success) {
            try {
              this.dynamicData.next(resp);
            } catch (e) {
              console.error(e);
            }
          }
        })
      );
  }

  // get dynamicDateData(): Observable<DashboardResponseModel> {
  //   return this.dynamicData.asObservable();
  // }
}

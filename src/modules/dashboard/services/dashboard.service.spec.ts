import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import StorageService from '@common/services/storage.service';
import {
  MerchantUser,
  MerchantUserToken
} from '@modules/auth/models/merchantUser.model';
import { AuthService } from '@modules/auth/services';
import { InvoicesModule } from '@modules/invoices/invoices.module';
import { MailModule } from '@modules/mail/mail.module';
import moment from 'moment';

import transferStatus from '../../../config/transferStatus';

import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService, AuthService, StorageService],
      imports: [
        HttpClientModule,
        InvoicesModule,
        MailModule,
        RouterTestingModule
      ]
    });

    dashboardService = TestBed.inject(DashboardService);

    authService = TestBed.inject(AuthService);
    authService.saveInStorage({
      email: 'admin@castler.com',
      firstName: 'Admin',
      lastName: 'User',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmI2NjY5YzAxNWI1ODdhNDhmY2Q5NzciLCJyb2xlcyI6WyJvd25lciJdLCJtZXJjaGFudFVzZXJJZCI6Ik1VNjA2MzY0NzQ1OCIsImFwaUNyZWRlbnRpYWxzUHJvdmlkZWQiOmZhbHNlLCJpYXQiOjE2NTU0NjY4NzMsImV4cCI6MTY1NTQ3MDQ3M30.-ssS6UFr3PikjJIhIWdFbOt6MvRfx9siblPiHGTtsIc'
    } as MerchantUser & MerchantUserToken);

    authService.saveInStaticVariable();
  });

  // describe('Inward Deposit Test', () => {
  //   // it('count', done => {
  //   //   const endDate = moment();
  //   //   const startDate = endDate.clone().subtract('5', 'months');
  //   //
  //   //   dashboardService
  //   //     .fetchDashboardFigure(
  //   //       DashboardService.MODULES.INWARD_TRANSACTION,
  //   //       DashboardService.SECTIONS.COUNT,
  //   //       {
  //   //         startDate: startDate.toDate(),
  //   //         endDate: endDate.toDate(),
  //   //         bankNames: []
  //   //       }
  //   //     )
  //   //     .subscribe(resp => {
  //   //       expect(resp).not.toBeUndefined();
  //   //       expect(resp.result).not.toBeUndefined();
  //   //       expect(resp.result).toBeGreaterThan(0);
  //   //
  //   //       done();
  //   //     });
  //   // });
  //
  //   // it('total amount', done => {
  //   //   const endDate = moment();
  //   //   const startDate = endDate.clone().subtract('5', 'months');
  //   //
  //   //   dashboardService
  //   //     .fetchDashboardFigure(
  //   //       DashboardService.MODULES.INWARD_TRANSACTION,
  //   //       DashboardService.SECTIONS.TOTAL_AMOUNT,
  //   //       {
  //   //         startDate: startDate.toDate(),
  //   //         endDate: endDate.toDate(),
  //   //         bankNames: []
  //   //       }
  //   //     )
  //   //     .subscribe(resp => {
  //   //       expect(resp).not.toBeUndefined();
  //   //       expect(resp.result).not.toBeUndefined();
  //   //       expect(resp.result).toBeGreaterThan(0);
  //   //
  //   //       done();
  //   //     });
  //   // });
  //   //
  //   // it('average amount', done => {
  //   //   const endDate = moment();
  //   //   const startDate = endDate.clone().subtract('5', 'months');
  //   //
  //   //   dashboardService
  //   //     .fetchDashboardFigure(
  //   //       DashboardService.MODULES.INWARD_TRANSACTION,
  //   //       DashboardService.SECTIONS.AVERAGE_DAILY_AMOUNT,
  //   //       {
  //   //         startDate: startDate.toDate(),
  //   //         endDate: endDate.toDate(),
  //   //         bankNames: []
  //   //       }
  //   //     )
  //   //     .subscribe(resp => {
  //   //       expect(resp).not.toBeUndefined();
  //   //       expect(resp.result).not.toBeUndefined();
  //   //       expect(resp.result).toBeGreaterThan(0);
  //   //
  //   //       done();
  //   //     });
  //   // });
  // });
  //
  // describe('Outward Deposit Test', () => {
  //   // it('count', done => {
  //   //     const endDate = moment();
  //   //     const startDate = endDate.clone().subtract('5', 'months');
  //
  //   //   dashboardService
  //   //     .fetchDashboardFigure(
  //   //       DashboardService.MODULES.OUTWARD_TRANSACTION,
  //   //       DashboardService.SECTIONS.COUNT,
  //   //       {
  //   //         statuses: [transferStatus.SUCCESS],
  //   //         startDate: startDate.toDate(),
  //   //         endDate: endDate.toDate(),
  //   //         bankNames: []
  //   //       }
  //   //     )
  //   //     .subscribe(resp => {
  //   //       expect(resp).not.toBeUndefined();
  //   //       expect(resp.result).not.toBeUndefined();
  //   //       expect(resp.result).toBeGreaterThan(0);
  //   //
  //   //       done();
  //   //     });
  //   // });
  //
  //   it('total amount', done => {
  //     const endDate = moment();
  //     const startDate = endDate.clone().subtract('5', 'months');
  //
  //     dashboardService
  //       .fetchDashboardFigure(
  //         DashboardService.MODULES.OUTWARD_TRANSACTION,
  //         DashboardService.SECTIONS.TOTAL_AMOUNT,
  //         {
  //           statuses: [transferStatus.SUCCESS],
  //           startDate: startDate.toDate(),
  //           endDate: endDate.toDate(),
  //           bankNames: []
  //         }
  //       )
  //       .subscribe(resp => {
  //         expect(resp).not.toBeUndefined();
  //         expect(resp.result).not.toBeUndefined();
  //         expect(resp.result).toBeGreaterThan(0);
  //
  //         done();
  //       });
  //   });
  //
  //   it('average amount', done => {
  //     const endDate = moment();
  //     const startDate = endDate.clone().subtract('5', 'months');
  //
  //     dashboardService
  //       .fetchDashboardFigure(
  //         DashboardService.MODULES.OUTWARD_TRANSACTION,
  //         DashboardService.SECTIONS.AVERAGE_DAILY_AMOUNT,
  //         {
  //           statuses: [transferStatus.SUCCESS],
  //           startDate: startDate.toDate(),
  //           endDate: endDate.toDate(),
  //           bankNames: []
  //         }
  //       )
  //       .subscribe(resp => {
  //         expect(resp).not.toBeUndefined();
  //         expect(resp.result).not.toBeUndefined();
  //         expect(resp.result).toBeGreaterThan(0);
  //
  //         done();
  //       });
  //   });
  // });

  describe('Merchant Data Test', () => {
    // it('count', done => {
    //   const endDate = moment();
    //   const startDate = endDate.clone().subtract('5', 'months');
    //
    //   dashboardService
    //     .fetchDashboardFigure(
    //       DashboardService.MODULES.MERCHANT,
    //       DashboardService.SECTIONS.COUNT,
    //       {
    //         startDate: startDate.toDate(),
    //         endDate: endDate.toDate(),
    //         bankNames: []
    //       }
    //     )
    //     .subscribe(resp => {
    //       expect(resp).not.toBeUndefined();
    //       expect(resp.result).not.toBeUndefined();
    //       expect(resp.result).toBeGreaterThan(0);
    //
    //       done();
    //     });
    // });
    //
    // it('billing amount', done => {
    //   const endDate = moment();
    //   const startDate = endDate.clone().subtract('5', 'months');
    //
    //   dashboardService
    //     .fetchDashboardFigure(
    //       DashboardService.MODULES.MERCHANT,
    //       DashboardService.SECTIONS.BILLING_AMOUNT,
    //       {
    //         startDate: startDate.toDate(),
    //         endDate: endDate.toDate(),
    //         bankNames: []
    //       }
    //     )
    //     .subscribe(resp => {
    //       expect(resp).not.toBeUndefined();
    //       expect(resp.result).not.toBeUndefined();
    //       expect(resp.result).toBeGreaterThan(0);
    //
    //       done();
    //     });
    // });

    // it('accounts data', done => {
    //   const endDate = moment();
    //   const startDate = endDate.clone().subtract('5', 'months');
    //
    //   dashboardService
    //     .fetchDashboardAccounts({
    //       startDate: startDate.toDate(),
    //       endDate: endDate.toDate(),
    //       bankNames: []
    //     })
    //     .subscribe(resp => {
    //       expect(resp).not.toBeUndefined();
    //       expect(resp.result).not.toBeUndefined();
    //       expect(resp.result).toBeGreaterThan(0);
    //
    //       done();
    //     });
    // });

    it('dashboard figures', done => {
      const endDate = moment();
      const startDate = endDate.clone().subtract('5', 'months');

      dashboardService
        .fetchFigures({
          startDate: startDate.toDate(),
          endDate: endDate.toDate(),
          bankNames: []
        })
        .subscribe(resp => {
          expect(resp).not.toBeUndefined();
          expect(resp.result).not.toBeUndefined();
          expect(resp.result).toBeGreaterThan(0);

          done();
        });
    });
  });
});

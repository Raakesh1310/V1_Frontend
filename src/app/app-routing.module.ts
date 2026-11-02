import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from '../environments/environment';

const routes: Routes = environment.disableSite
  ? [
    {
      path: '**',
      pathMatch: 'full',
      loadChildren: () =>
        import('modules/error/error-routing.module').then(
          m => m.ErrorRoutingModule
        )
    }
  ]
  : [
    {
      path: 'auth',
      loadChildren: () =>
        import('modules/auth/auth-routing.module').then(
          m => m.AuthRoutingModule
        )
    },
    {
      path: '',
      pathMatch: 'full',
      redirectTo: '/start'
    },
    {
      path: 'super-admin',
      children: [
        {
          path: 'payee',
          loadChildren: () =>
            import('modules/payee/payee-routing-sa.module').then(
              m => m.PayeeRoutingSaModule
            )
        },
        {
          path: 'transaction',
          loadChildren: () =>
            import('modules/transactions/transaction-routing-sa.module').then(
              m => m.TransactionRoutingSaModule
            )
        },
        {
          path: 'statement',
          loadChildren: () =>
            import('modules/statements/statements-routing.module').then(
              m => m.StatementsRoutingModule
            )
        },
        {
          path: 'invoices',
          loadChildren: () =>
            import('modules/invoices/invoices-routing.module').then(
              m => m.InvoicesRoutingModule
            )
        },
        {
          path: 'deal',
          loadChildren: () =>
            import('modules/deal/deal-routing-sa.module').then(
              m => m.DealRoutingSaModule
            )
        },
        {
          path: 'mail',
          loadChildren: () =>
            import('modules/mail/mail-routing.module').then(
              m => m.MailRoutingModule
            )
        },
        {
          path: 'escrow-pages',
          loadChildren: () =>
            import(
              'modules/escrow-pages/escrow-pages-routing-sa.module'
            ).then(m => m.EscrowPagesSaRoutingModule)
        },
        {
          path: 'transfer',
          loadChildren: () =>
            import('modules/transfers/transfers-routing-sa.module').then(
              m => m.TransfersRoutingSaModule
            )
        },
        {
          path: 'create-transfer',
          loadChildren: () =>
            import('modules/transfers/transfers-routing.module').then(
              m => m.TransfersRoutingModule
            )
        },
        {
          path: 'merchant',
          loadChildren: () =>
            import('modules/merchant/merchant-routing.module').then(
              m => m.MerchantRoutingModule
            )
        },
        {
          path: 'escrow',
          loadChildren: () =>
            import('modules/accounts/accounts-routing-sa.module').then(
              m => m.AccountsRoutingModule
            )
        },
        {
          path: 'challan',
          loadChildren: () =>
            import('modules/challan/challan-routing-sa.module').then(
              m => m.ChallanRoutingSaModule
            )
        },
        {
          path: 'logs',
          loadChildren: () =>
            import('modules/activity-logs/activity-logs-routing.module').then(
              m => m.ActivityLogsRoutingModule
            )
        },
        {
          path: 'approvals',
          loadChildren: () =>
            import('modules/approvals/approvals-routing.module').then(
              m => m.ApprovalsRoutingModule
            )
        },
        {
          path: 'allescrowqr',
          loadChildren: () =>
            import('modules/escrow-qr/escrow-qr-routing-sa.module ').then(
              m => m.EscrowQrRoutingSaModule
            )
        },
        {
          path: 'alluserskyc',
          loadChildren: () =>
            import('modules/all-users/all-users-routing.module').then(
              m => m.AllUsersRoutingModule
            )
        },
        {
          path: 'allvpas',
          loadChildren: () =>
            import('modules/vpa/vpa-routing-sa.module').then(
              m => m.VpaRoutingModule
            )
        },
        {
          path: 'notifications',
          loadChildren: () =>
            import('modules/notifications/notifications-routing.module').then(
              m => m.NotificationsRoutingModule
            )
        },
        {
          path: 'escrowqr',
          loadChildren: () =>
            import('modules/escrow-qr/escrow-qr-routing.module').then(
              m => m.EscrowQrRoutingModule
            )
        },
        {
          path: 'all-users',
          loadChildren: () =>
            import('modules/users/users-routing.module').then(
              m => m.UsersRoutingModule
            )
        },
        {
          path: 'bank-account',
          loadChildren: () =>
            import('modules/bank-account/bank-account-routing.module').then(
              m => m.BankAccountRoutingModule
            )
        },
        {
          path: 'parties',
          loadChildren: () =>
            import('modules/parties/parties-routing-sa.module').then(
              m => m.PartiesRoutingSaModule
            )
        },
        {
          path: 'report',
          loadChildren: () =>
            import('modules/report/report-routing-sa.module').then(
              m => m.ReportRoutingSaModule
            )
        },
      ]
      // canActivate: [TAndCGuardGuard]
    },
    {
      path: environment.urlPortalPrefix,
      children: [
        {
          path: 'deal',
          loadChildren: () =>
            import('modules/deal/deal-routing.module').then(
              m => m.DealRoutingModule
            )
        },
        {
          path: 'document',
          loadChildren: () =>
            import('modules/documents/documents-routing.module').then(
              m => m.DocumentsRoutingModule
            )
        },
        {
          path: 'fixed-deposit',
          loadChildren: () =>
            import('modules/fixed-deposit/fixed-deposit-routing.module').then(
              m => m.FixedDepositRoutingModule
            )
        },
        {
          path: 'userskyc',
          loadChildren: () =>
            import('@modules/all-users/all-users-kyc-routing.module').then(
              m => m.UsersKYCRoutingModule
            )
        },
        {
          path: 'escrow',
          loadChildren: () =>
            import('modules/accounts/accounts-routing.module').then(
              m => m.AccountsRoutingModule
            )
        },
        {
          path: 'transaction',
          loadChildren: () =>
            import('modules/transactions/transactions-routing.module').then(
              m => m.TransactionsRoutingModule
            )
        },
        {
          path: 'payee',
          loadChildren: () =>
            import('modules/payee/payee-routing.module').then(
              m => m.PayeeRoutingModule
            )
        },
        {
          path: 'user',
          loadChildren: () =>
            import('modules/users/users-routing.module').then(
              m => m.UsersRoutingModule
            )
        },
        {
          path: 'transfer',
          loadChildren: () =>
            import('modules/transfers/transfers-routing.module').then(
              m => m.TransfersRoutingModule
            )
        },
        {
          path: 'passbook',
          loadChildren: () =>
            import('modules/passbook/passbook-routing.module').then(
              m => m.PassbookRoutingModule
            )
        },
        {
          path: 'challan',
          loadChildren: () =>
            import('@modules/challan/challan-routing.module').then(
              m => m.ChallanRoutingModule
            )
        },
        {
          path: 'profile',
          loadChildren: () =>
            import('modules/profile/profile-routing.module').then(
              m => m.ProfileRoutingModule
            )
        },
        {
          path: 'milestone',
          loadChildren: () =>
            import('@modules/milestone/milestone-routing.module').then(
              m => m.MilestoneRoutingModule
            )
        },
        {
          path: 'escrow-page',
          loadChildren: () =>
            import('modules/escrow-pages/escrow-pages-routing.module').then(
              m => m.EscrowPagesRoutingModule
            )
        },
        {
          path: 'approvals',
          loadChildren: () =>
            import('modules/approvals/approvals-routing.module').then(
              m => m.ApprovalsRoutingModule
            )
        },
        {
          path: 'escrowqr',
          loadChildren: () =>
            import('modules/escrow-qr/escrow-qr-routing.module').then(
              m => m.EscrowQrRoutingModule
            )
        },
        {
          path: 'allvpas',
          loadChildren: () =>
            import('modules/vpa/vpa-routing.module').then(
              m => m.VpaRoutingModule
            )
        },
        {
          path: 'bank-account',
          loadChildren: () =>
            import('modules/bank-account/bank-account-routing.module').then(
              m => m.BankAccountRoutingModule
            )
        },
        {
          path: 'report',
          loadChildren: () =>
            import('modules/report/report-routing.module').then(
              m => m.ReportRoutingModule
            )
        }
      ]
      // canActivate: [TAndCGuardGuard]
    },
    {
      path: 'escrow-page',
      loadChildren: () =>
        import(
          'modules/escrow-pages/escrow-pages-routing-public.module'
        ).then(m => m.EscrowPagesRoutingModule)
    },
    {
      path: 'kyc',
      loadChildren: () =>
        import('modules/kyc-widgets/kyc-widgets-routing.module').then(
          m => m.KycWidgetsRoutingModule
        )
    },
    {
      path: 'transfer',
      loadChildren: () =>
        import('modules/transfers/transfer-routing-public.module').then(
          m => m.TransferRoutingModule
        )
    },
    // {
    //   path: 'charts',
    //   loadChildren: () =>
    //     import('modules/charts/charts-routing.module').then(
    //       m => m.ChartsRoutingModule
    //     )
    // },
    {
      path: 'start',
      loadChildren: () =>
        import('modules/splash-screen/splash-screen-routing.module').then(
          m => m.SplashScreenRoutingModule
        )
    },
    {
      path: 'helpdesk',
      loadChildren: () =>
        import('modules/helpdesk/helpdesk-routing.module').then(
          m => m.HelpdeskRoutingModule
        )
    },
    {
      path: 'dashboard',
      loadChildren: () =>
        import('modules/dashboard/dashboard-routing.module').then(
          m => m.DashboardRoutingModule
        )
    },
    {
      path: 'error',
      loadChildren: () =>
        import('modules/error/error-routing.module').then(
          m => m.ErrorRoutingModule
        )
    },
    // {
    //   path: 'tables',
    //   loadChildren: () =>
    //     import('modules/tables/tables-routing.module').then(
    //       m => m.TablesRoutingModule
    //     )
    // },
    {
      path: 'version',
      loadChildren: () =>
        import('modules/app-common/app-common-routing.module').then(
          m => m.AppCommonRoutingModule
        )
    },
    {
      path: '**',
      pathMatch: 'full',
      loadChildren: () =>
        import('modules/error/error-routing.module').then(
          m => m.ErrorRoutingModule
        )
    }
  ];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

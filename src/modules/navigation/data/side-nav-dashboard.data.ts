import { SideNavItems, SideNavSection } from '@modules/navigation/models';

import merchantUserRoles from '../../../config/merchantUserRoles';
import { environment } from '../../../environments/environment';

export const sideNavSections: SideNavSection[] = [
  {
    text: '  ',
    items: [
      'dashboards',
      'payee',
      'spacing',
      'digitalEscrow',
      'approvals',
      'accounts',
      'VPAs',
      'usersKYC',
      'transfer',
      'passbook',
      'escrowPage',
      // 'milestone',
      'spacing',
      'connectedBanking',
      'bankAccounts',
      'connectedBankingTransfer',
      'bankAccountTransfer',
      'depositList',
      // 'helpdesk',
      'challan',
      'deal',
      'escrowQR',
      'spacing',
      'manageTeam',
      'reports',
      'profile',
    ]
  }
];

export const PayeesSubMenuList = {
  PayeeList: 'List',
  AddPayee: 'Add Payee',
  PayeeValidation: 'Payee Validation'
};

export const TransferSubMenuList = {
  SingleTransfer: 'Single Transfer',
  BulkTransfer: 'Bulk Transfer',
  // UPITransfer: 'UPI Transfer'
};

export const sideNavItems: SideNavItems = {
  spacing: {
    text: '',
    roles: [merchantUserRoles.OWNER, merchantUserRoles.ADMIN]
  },
  connectedBanking: {
    text: 'Connected Banking',
    roles: [merchantUserRoles.OWNER, merchantUserRoles.ADMIN]
  },
  digitalEscrow: {
    text: 'Digital Escrow',
    roles: [merchantUserRoles.OWNER, merchantUserRoles.ADMIN]
  },
  approvals: {
    icon: 'users',
    link: environment.urlPortalPrefix + '/approvals',
    text: 'My Approvals',
    roles: [merchantUserRoles.AUTHORIZER, merchantUserRoles.ACCOUNT_AUTHORIZER, merchantUserRoles.PAYEE_AUTHORIZER]
  },
  charts: {
    icon: 'bar-chart',
    link: '/charts',
    text: 'Charts',
    roles: [merchantUserRoles.OWNER]
  },
  manageTeam: {
    link: environment.urlPortalPrefix + '/profile/teams',
    text: 'Manage Teams',
    icon: 'users',
    roles: [merchantUserRoles.OWNER]
    // new: true
  },
  usersKYC: {
    icon: 'check-circle',
    link: environment.urlPortalPrefix + '/userskyc',
    text: 'KYC',
    roles: [merchantUserRoles.OWNER]
  },
  profile: {
    icon: 'user',
    text: 'My Profile',
    link: environment.urlPortalPrefix + '/profile',
    roles: [merchantUserRoles.OWNER, merchantUserRoles.INDIVIDUAL]
  },
  payee: {
    icon: 'users',
    text: 'Manage Payees',
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.MANAGER,
      merchantUserRoles.AUTHORIZER,
      merchantUserRoles.ACCOUNT_AUTHORIZER
    ],
    submenu: [
      {
        link: environment.urlPortalPrefix + '/payee',
        text: PayeesSubMenuList.PayeeList,
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER,
          merchantUserRoles.AUTHORIZER,
          merchantUserRoles.ACCOUNT_AUTHORIZER
        ]
      },
      {
        link: environment.urlPortalPrefix + '/payee/form',
        text: PayeesSubMenuList.AddPayee,
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER
        ]
      },
      {
        link: environment.urlPortalPrefix + '/payee/validation',
        text: PayeesSubMenuList.PayeeValidation,
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER,
          merchantUserRoles.CUSTOM
        ]
      }
    ]
  },
  transfer: {
    icon: 'send',
    text: 'Create Transfer',
    roles: [merchantUserRoles.OWNER, merchantUserRoles.ADMIN],
    submenu: [
      {
        link: environment.urlPortalPrefix + '/transfer',
        text: 'Single Transfer',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER
        ]
      },
      {
        link: environment.urlPortalPrefix + '/transfer/bulk',
        text: 'Bulk Transfer',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER
        ]
      }
      // {
      //   link: environment.urlPortalPrefix + '/transfer/upi',
      //   text: 'UPI Transfer',
      //   roles: [
      //     merchantUserRoles.OWNER,
      //     merchantUserRoles.ADMIN,
      //     merchantUserRoles.FINANCE,
      //     merchantUserRoles.MANAGER
      //   ]
      // }
      // {
      //   link: environment.urlPortalPrefix + '/transfer/scheduled',
      //   text: 'My Scheduled Transfers',
      //   roles: [
      //     merchantUserRoles.OWNER,
      //     merchantUserRoles.ADMIN,
      //     merchantUserRoles.FINANCE,
      //     merchantUserRoles.MANAGER
      //   ]
      // }
    ]
  },
  connectedBankingTransfer: {
    icon: 'send',
    text: 'Create Transfer',
    roles: [merchantUserRoles.OWNER, merchantUserRoles.ADMIN],
    submenu: [
      {
        link: environment.urlPortalPrefix + '/transfer/bank-accounts',
        text: 'Single Transfer',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER,
        ]
      },
      {
        link: environment.urlPortalPrefix + '/transfer/bulk/bank-accounts',
        text: 'Bulk Transfer',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER,
        ]
      }
      // {
      //   link: environment.urlPortalPrefix + '/transfer/upi/bank-accounts',
      //   text: 'UPI Transfer',
      //   roles: [
      //     merchantUserRoles.OWNER,
      //     merchantUserRoles.ADMIN,
      //     merchantUserRoles.FINANCE,
      //     merchantUserRoles.MANAGER
      //   ]
      // }
      // {
      //   link: environment.urlPortalPrefix + '/transfer/scheduled',
      //   text: 'My Scheduled Transfers',
      //   roles: [
      //     merchantUserRoles.OWNER,
      //     merchantUserRoles.ADMIN,
      //     merchantUserRoles.FINANCE,
      //     merchantUserRoles.MANAGER
      //   ]
      // }
    ]
  },
  escrowQR: {
    icon: 'user',
    text: 'Escrow QR',
    link: environment.urlPortalPrefix + '/escrowqr',
    roles: [merchantUserRoles.OWNER, merchantUserRoles.ADMIN]
  },
  // deal: {
  //   icon: 'package',
  //   text: 'Deals',
  //   roles: [merchantUserRoles.OWNER, merchantUserRoles.INDIVIDUAL],
  //   submenu: [
  //     {
  //       link: environment.urlPortalPrefix + '/deal',
  //       text: 'List',
  //       roles: [merchantUserRoles.OWNER, merchantUserRoles.INDIVIDUAL]
  //     },
  //     {
  //       link: environment.urlPortalPrefix + '/deal/form',
  //       text: 'Add Deal',
  //       roles: [merchantUserRoles.OWNER, merchantUserRoles.INDIVIDUAL]
  //     }
  //   ]
  // },
  milestone: {
    icon: 'flag',
    text: 'Milestone',
    submenu: [
      {
        link: environment.urlPortalPrefix + '/milestone',
        text: 'List',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER
        ]
      },
      {
        link: '/milestone/create',
        text: 'Add New',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER
        ]
      }
    ],
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.FINANCE,
      merchantUserRoles.MANAGER
    ]
  },
  bankAccountTransfer: {
    icon: 'book-open',
    text: 'Transfers List',
    link: environment.urlPortalPrefix + '/passbook/bank-accounts',
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.FINANCE,
      merchantUserRoles.PAYEE,
      merchantUserRoles.INDIVIDUAL,
      merchantUserRoles.AUTHORIZER,
      merchantUserRoles.ACCOUNT_AUTHORIZER
    ]
  },
  passbook: {
    icon: 'book-open',
    text: 'My Passbook',
    submenu: [
      {
        link: environment.urlPortalPrefix + '/transaction',
        text: 'Inward Funds Deposit',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER,
          merchantUserRoles.INDIVIDUAL,
          merchantUserRoles.PAYEE,
          merchantUserRoles.AUTHORIZER,
          merchantUserRoles.ACCOUNT_AUTHORIZER
        ]
      },
      {
        link: environment.urlPortalPrefix + '/passbook',
        text: 'Outward Fund Transfer',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER,
          merchantUserRoles.INDIVIDUAL,
          merchantUserRoles.PAYEE,
          merchantUserRoles.AUTHORIZER,
          merchantUserRoles.ACCOUNT_AUTHORIZER
        ]
      }
    ],
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.FINANCE,
      merchantUserRoles.PAYEE,
      merchantUserRoles.INDIVIDUAL,
      merchantUserRoles.AUTHORIZER,
      merchantUserRoles.ACCOUNT_AUTHORIZER
    ]
  },
  VPAs: {
    icon: 'minimize-2',
    link: environment.urlPortalPrefix + '/allvpas',
    text: 'VPAs',
    roles: [merchantUserRoles.OWNER, merchantUserRoles.ADMIN]
  },
  accounts: {
    icon: 'book',
    text: 'Escrows',
    submenu: [
      {
        link: environment.urlPortalPrefix + '/escrow',
        text: 'List',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER,
          merchantUserRoles.PAYEE,
          merchantUserRoles.AUTHORIZER,
          merchantUserRoles.ACCOUNT_AUTHORIZER
        ]
      },
      {
        link: environment.urlPortalPrefix + '/escrow/form',
        text: 'Add Escrow',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER
        ]
        // new: true
      }
    ],

    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.MANAGER,
      merchantUserRoles.PAYEE,
      merchantUserRoles.AUTHORIZER,
      merchantUserRoles.ACCOUNT_AUTHORIZER
    ]
  },
  dashboards: {
    icon: 'activity',
    link: '/dashboard',
    text: 'Dashboard',
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.FINANCE,
      merchantUserRoles.MANAGER,
      merchantUserRoles.INDIVIDUAL
    ]
  },
  challan: {
    icon: 'download',
    text: 'Challans',
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.MANAGER
    ],
    submenu: [
      {
        link: environment.urlPortalPrefix + '/challan',
        text: 'List',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.MANAGER
        ]
      },
      {
        link: environment.urlPortalPrefix + '/challan/form',
        text: 'Create Challan',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.MANAGER
        ]
        //new: true
      }
    ]
  },
  helpdesk: {
    icon: 'help-circle',
    text: 'Help & Support',
    submenu: [
      {
        link: environment.urlPortalPrefix + '/helpdesk',
        text: 'Raise new request',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER
        ]
        // new: true
      },
      {
        link: environment.urlPortalPrefix + '/helpdesk/track',
        text: 'Track your request',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER
        ]
        // new: true
      }
    ],
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.FINANCE,
      merchantUserRoles.MANAGER
    ]
  },
  escrowPage: {
    icon: 'layout',
    text: 'Escrow Pages',
    submenu: [
      {
        link: environment.urlPortalPrefix + '/escrow-page',
        text: 'List',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER
        ]
        // new: true
      },
      {
        link: environment.urlPortalPrefix + '/escrow-page/form',
        text: 'Create Escrow Page',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.MANAGER
        ]
        // new: true
      }
    ],
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.FINANCE,
      merchantUserRoles.MANAGER
    ]
  },
  bankAccounts: {
    icon: 'minimize-2',
    text: 'Bank Account',
    link: environment.urlPortalPrefix + '/bank-account',
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.FINANCE
    ]
  },

  depositList: {
    icon: 'book-open',
    text: 'Deposit List',
    link: environment.urlPortalPrefix + '/bank-account/deposit',
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.FINANCE
    ]
  },

  reports: {
    icon: 'book-open',
    text: 'Reports',
    link: environment.urlPortalPrefix + '/report',
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.FINANCE
    ]
  },

};

export const sideNavSectionsAdmin: SideNavSection[] = [
  {
    text: 'Admin',
    items: [
      // 'allUsers',
      'dashboard',
      'allApprovals',
      'allMerchants',
      'allUsersList',
      'allUsersKyc',
      'allVPAs',
      'connectedBanking',
      'allAccount',
      'allDeals',
      'transfer',
      'allTransfer',
      'allTransaction',
      'allStatements',
      'allInvoices',
      'allChallans',
      'allActivities',
      'allescrowqr',
      'allEscrowPages',
      'allNotifications',
      'reports',
      // 'allUserKyc',
      'document',
      'mail',
      'payee'
      // 's'
      // environment.urlPortalPrefix + '/fixed-deposit'
    ]
  }
];

export const sideNavItemsAdmin: SideNavItems = {
  dashboard: {
    icon: 'minimize-2',
    link: '/dashboard',
    text: 'Dashboard',
    roles: [merchantUserRoles.OWNER, merchantUserRoles.SUPER_ADMIN_VIEWER]
  },
  allApprovals: {
    icon: 'minimize-2',
    link: environment.urlAdminPrefix + '/approvals',
    text: 'My Approvals',
    roles: [
      merchantUserRoles.AUTHORIZER,
      merchantUserRoles.TRUSTEE,
      merchantUserRoles.MERCHANT_AUTHORIZER,
      merchantUserRoles.PAYEE_AUTHORIZER
    ]
  },
  allUsers: {
    icon: 'user',
    text: 'All Users KYC',
    submenu: [
      {
        link: '/user/list',
        text: 'List',
        roles: [merchantUserRoles.OWNER]
      },
      {
        link: '/user',
        text: 'Add User',
        roles: [merchantUserRoles.OWNER]
        // new: true
      }
    ],
    roles: [merchantUserRoles.OWNER]
  },
  allUsersList: {
    icon: 'minimize-2',
    link: environment.urlAdminPrefix + '/all-users',
    text: 'All Users List',
    roles: [merchantUserRoles.OWNER]
  },
  allMerchants: {
    icon: 'minimize-2',
    text: 'All Merchants',
    submenu: [
      {
        link: environment.urlAdminPrefix + '/merchant/',
        text: 'List',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.TRUSTEE,
          merchantUserRoles.SUPER_ADMIN_VIEWER,
          merchantUserRoles.MERCHANT_AUTHORIZER,
          merchantUserRoles.PAYEE_AUTHORIZER
        ]
      },
      {
        link: environment.urlAdminPrefix + '/merchant/form',
        text: 'Add Merchant',
        roles: [merchantUserRoles.OWNER]
        // new: true
      }
    ],
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.TRUSTEE,
      merchantUserRoles.SUPER_ADMIN_VIEWER,
      merchantUserRoles.MERCHANT_AUTHORIZER
    ]
  },
  payee: {
    icon: 'users',
    text: 'Manage Payees',
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.MANAGER,
      merchantUserRoles.AUTHORIZER,
      merchantUserRoles.ACCOUNT_AUTHORIZER
    ],
    submenu: [
      {
        link: environment.urlPortalPrefix + '/payee/validation',
        text: PayeesSubMenuList.PayeeValidation,
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.ADMIN,
          merchantUserRoles.FINANCE,
          merchantUserRoles.MANAGER,
          merchantUserRoles.CUSTOM
        ]
      }
    ]
  },
  allUsersKyc: {
    icon: 'minimize-2',
    link: environment.urlAdminPrefix + '/alluserskyc',
    text: 'All Users KYC',
    roles: [merchantUserRoles.OWNER]
  },
  allVPAs: {
    icon: 'minimize-2',
    link: environment.urlAdminPrefix + '/allvpas',
    text: 'All VPAs',
    roles: [merchantUserRoles.OWNER]
  },
  allescrowqr: {
    icon: 'minimize-2',
    link: environment.urlAdminPrefix + '/allescrowqr',
    text: 'All Escrow QRs',
    roles: [merchantUserRoles.OWNER]
  },
  transfer: {
    icon: 'minimize-2',
    text: 'Create Transfer',
    roles: [merchantUserRoles.OWNER],
    submenu: [
      {
        link: environment.urlAdminPrefix + '/create-transfer',
        text: 'Single Transfer',
        roles: [merchantUserRoles.OWNER]
      },
      {
        link: environment.urlAdminPrefix + '/create-transfer/bulk',
        text: 'Bulk Transfer',
        roles: [merchantUserRoles.OWNER]
      }
      // {
      //   link: environment.urlPortalPrefix + '/transfer/scheduled',
      //   text: 'My Scheduled Transfers',
      //   roles: [
      //     merchantUserRoles.OWNER,
      //     merchantUserRoles.ADMIN,
      //     merchantUserRoles.FINANCE,
      //     merchantUserRoles.MANAGER
      //   ]
      // }
    ]
  },
  allTransfer: {
    icon: 'minimize-2',
    link: environment.urlAdminPrefix + '/transfer',
    text: 'All Transfers',
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.TRUSTEE,
      merchantUserRoles.SUPER_ADMIN_VIEWER,
      merchantUserRoles.MERCHANT_AUTHORIZER
    ]
  },
  allStatements: {
    icon: 'minimize-2',
    link: environment.urlAdminPrefix + '/statement',
    text: 'All Statements',
    roles: [merchantUserRoles.OWNER, merchantUserRoles.SUPER_ADMIN_VIEWER]
  },
  // allDeals: {
  //   icon: 'minimize-2',
  //   link: environment.urlAdminPrefix + '/deal',
  //   text: 'All Deals',
  //   roles: [merchantUserRoles.OWNER]
  // },
  allChallans: {
    icon: 'minimize-2',
    //link: environment.urlAdminPrefix + '/challan',
    text: 'All Challans',
    roles: [merchantUserRoles.OWNER, merchantUserRoles.SUPER_ADMIN_VIEWER],
    submenu: [
      {
        link: environment.urlAdminPrefix + '/challan',
        text: 'List',
        roles: [merchantUserRoles.OWNER, merchantUserRoles.SUPER_ADMIN_VIEWER]
      },
      {
        link: environment.urlAdminPrefix + '/challan/form',
        text: 'Create Challan',
        roles: [merchantUserRoles.OWNER]
        // new: true
      }
    ]
  },
  allActivities: {
    icon: 'minimize-2',
    link: environment.urlAdminPrefix + '/logs',
    text: 'All Activities',
    roles: [merchantUserRoles.OWNER]
  },
  allEscrowPages: {
    icon: 'minimize-2',
    link: environment.urlAdminPrefix + '/escrow-pages',
    text: 'All Escrow Pages',
    roles: [merchantUserRoles.OWNER, merchantUserRoles.SUPER_ADMIN_VIEWER]
  },
  allTransaction: {
    icon: 'minimize-2',
    link: environment.urlAdminPrefix + '/transaction',
    text: 'All Deposits',
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.TRUSTEE,
      merchantUserRoles.SUPER_ADMIN_VIEWER,
      merchantUserRoles.MERCHANT_AUTHORIZER
    ]
  },

  // allUserKyc: {
  //   icon: 'minimize-2',
  //   link: '/profile',
  //   text: 'All User KYC',
  //   roles: [merchantUserRoles.OWNER]
  // },
  allAccount: {
    icon: 'minimize-2',
    text: 'All Escrows',
    submenu: [
      {
        link: environment.urlAdminPrefix + '/escrow',
        text: 'List',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.TRUSTEE,
          merchantUserRoles.SUPER_ADMIN_VIEWER,
          merchantUserRoles.MERCHANT_AUTHORIZER
        ]
      },
      {
        link: environment.urlAdminPrefix + '/escrow/form',
        text: 'Add Escrow',
        roles: [merchantUserRoles.OWNER]
        // new: true
      }
    ],
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.TRUSTEE,
      merchantUserRoles.SUPER_ADMIN_VIEWER,
      merchantUserRoles.MERCHANT_AUTHORIZER
    ]
  },
  connectedBanking: {
    icon: 'minimize-2',
    text: 'Connected Banking',
    submenu: [
      {
        link: environment.urlAdminPrefix + '/bank-account',
        text: 'Bank Account',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.TRUSTEE,
          merchantUserRoles.SUPER_ADMIN_VIEWER,
          merchantUserRoles.MERCHANT_AUTHORIZER
        ]
      },
      {
        link: environment.urlAdminPrefix + '/transfer/bank-account',
        text: 'Transfers List',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.TRUSTEE,
          merchantUserRoles.SUPER_ADMIN_VIEWER,
          merchantUserRoles.MERCHANT_AUTHORIZER
        ]
      },
      {
        link: environment.urlAdminPrefix + '/bank-account/deposit',
        text: 'Deposits List',
        roles: [
          merchantUserRoles.OWNER,
          merchantUserRoles.TRUSTEE,
          merchantUserRoles.SUPER_ADMIN_VIEWER,
          merchantUserRoles.MERCHANT_AUTHORIZER
        ]
      }
    ],
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.TRUSTEE,
      merchantUserRoles.SUPER_ADMIN_VIEWER,
      merchantUserRoles.MERCHANT_AUTHORIZER
    ]
  },
  document: {
    icon: 'minimize-2',
    text: 'Agreements',
    submenu: [
      {
        link: environment.urlPortalPrefix + '/document/order',
        text: 'All Agreements',
        roles: [merchantUserRoles.OWNER]
      },
      {
        link: environment.urlPortalPrefix + '/document/form',
        text: 'Create Agreement',
        roles: [merchantUserRoles.OWNER]
      }
    ],
    roles: [merchantUserRoles.OWNER]
  },
  fixedDeposit: {
    icon: 'minimize-2',
    text: 'Fixed Deposits',
    submenu: [
      {
        link: environment.urlAdminPrefix + '/fixed-deposit',
        text: 'All FDs',
        roles: [merchantUserRoles.OWNER]
      },
      {
        link: environment.urlAdminPrefix + '/fixed-deposit/form',
        text: 'Create FD',
        roles: [merchantUserRoles.OWNER]
      }
    ],
    roles: [merchantUserRoles.OWNER]
  },
  mail: {
    icon: 'minimize-2',
    text: 'Mail',
    submenu: [
      {
        link: environment.urlAdminPrefix + '/mail',
        text: 'All Mails',
        roles: [merchantUserRoles.OWNER]
      },
      {
        link: environment.urlAdminPrefix + '/mail/form',
        text: 'Send Mail',
        roles: [merchantUserRoles.OWNER]
      }
    ],
    roles: [merchantUserRoles.OWNER]
  },
  allInvoices: {
    icon: 'minimize-2',
    link: environment.urlAdminPrefix + '/invoices',
    text: 'All Invoices',
    roles: [merchantUserRoles.OWNER, merchantUserRoles.SUPER_ADMIN_VIEWER]
  },

  allNotifications: {
    icon: 'minimize-2',
    text: 'Notifications',
    submenu: [
      {
        link: environment.urlAdminPrefix + '/notifications',
        text: 'All Notifications',
        roles: [merchantUserRoles.SUPER_ADMIN, merchantUserRoles.OWNER]
      },
      {
        link: environment.urlAdminPrefix + '/notifications/create',
        text: 'Create Notification',
        roles: [merchantUserRoles.SUPER_ADMIN, merchantUserRoles.OWNER]
      }
    ],
    roles: [merchantUserRoles.SUPER_ADMIN, merchantUserRoles.OWNER]
  },

  reports: {
    icon: 'book-open',
    text: 'Reports',
    link: environment.urlAdminPrefix + '/report',
    roles: [
      merchantUserRoles.OWNER,
      merchantUserRoles.ADMIN,
      merchantUserRoles.FINANCE
    ]
  },

  // s:{
  //   icon: 'minimize-2',
  //   text: 'Bank Account', link: environment.urlAdminPrefix + '/bank-account',
  //   roles: [merchantUserRoles.SUPER_ADMIN, merchantUserRoles.OWNER]
  // }
};

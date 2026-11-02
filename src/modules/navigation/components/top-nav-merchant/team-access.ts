export const access: any = {
  accounts: {
    'Add Account': 'createAccount',
    List: 'accountList'
  },

  payee: {
    List: 'payeeList',
    'Add Payee': 'addPayee'
  },

  transfer: {
    'Single Transfer': 'singleTransfer',
    'Bulk Transfer': 'bulkTransfer'
  },

  passbook: {
    'Inward Funds Deposit': 'myPassbook',
    'Outward Fund Transfer': 'myPassbook'
  },

  escrowPage: {
    List: 'escrowPages',
    'Create Escrow Page': 'escrowPages'
  },

  challan: {
    List: 'challans',
    'Create Challan': 'challans'
  },

  bankAccounts: {
    'Bank Account': 'bankAccounts'
  },

  bankAccountTransfer: {
    'Bank Account Transfer': 'bankAccountTransfer'
  },

  connectedBankingTransfer: {
    'Single Transfer': 'connectedBankingSingleTransfer',
    'Bulk Transfer': 'connectedBankingBulkTransfer'
  },

  depositList: {
    'Deposit List': 'depositList'
  },

  escrowQR: {},
  digitalEscrow: {
    'Digital Escrow': 'digitalEscrow'
  },
  connectedBanking: {
    'Connected Banking': 'connectedBanking'
  }
};

export const getAccessFeatures = (accessObject: any) => {
  let accessFeatureObject: any = {};

  Object.entries(accessObject).forEach(([key, featuresList]) => {
    (featuresList as string[]).forEach(feature => {
      accessFeatureObject[access[key][feature]] = true;
    });
  });

  return accessFeatureObject;
};

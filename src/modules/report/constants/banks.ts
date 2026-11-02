import banksTypes from "@modules/accounts/constants/banksTypes";

export const banks = [
    banksTypes.ICICI.toUpperCase(),
    banksTypes.YES_BANK.split('_')[0].toUpperCase() + ' Bank',
    banksTypes.RBL.toUpperCase(),
    banksTypes.IDFC.toUpperCase(),
    banksTypes.HDFC.toUpperCase(),
]
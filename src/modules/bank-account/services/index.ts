import { BankAccountService } from "./bank-account.service";
import { BankAccountDepositService } from "./bank-account-transaction-deposit.service";

export const services = [BankAccountService, BankAccountDepositService];

export * from "./bank-account.service";
export * from "./bank-account-transaction-deposit.service";
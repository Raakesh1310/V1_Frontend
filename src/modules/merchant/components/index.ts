import { MerchantBasicDetailComponent } from './merchant-basic-detail/merchant-basic-detail.component';
import { MerchantTableComponent } from './merchant-table/merchant-table.component';
import { MerchantInvioceDetailsComponent } from './merchant-invioce-details/merchant-invioce-details.component';
import { MerchantBillingDetailComponent } from './merchant-billing-detail/merchant-billing-detail.component';
import { TwoDigitDecimalNumberDirective } from './merchant-invioce-details/twoDigitDecimalNumber'
import { PercentageValidate } from './merchant-invioce-details/percentValidation'

export const components = [
  MerchantTableComponent,
  MerchantBasicDetailComponent,
  MerchantInvioceDetailsComponent,
  TwoDigitDecimalNumberDirective,
  PercentageValidate
 // MerchantBillingDetailComponent
];

export * from './merchant-table/merchant-table.component';
export * from './merchant-basic-detail/merchant-basic-detail.component';
export * from './merchant-invioce-details/merchant-invioce-details.component';
export * from './merchant-billing-detail/merchant-billing-detail.component';

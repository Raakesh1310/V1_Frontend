import { ChallanDetailComponent } from '@modules/challan/components/challan-detail/challan-detail.component';
import { ChallanFormPageComponent } from '@modules/challan/containers/challan-form-page/challan-form-page.component';
import { ChallanTablePageComponent } from '@modules/challan/containers/challan-table-page/challan-table-page.component';
import { ChallanComponent } from '@modules/challan/containers/challan/challan.component';

export const containers = [
  ChallanComponent,
  ChallanFormPageComponent,
  ChallanTablePageComponent,
  ChallanDetailComponent
];
export * from './challan/challan.component';
export * from './challan-form-page/challan-form-page.component';
export * from './challan-table-page/challan-table-page.component';
export * from './challan-detail-page/challan-detail-page.component';

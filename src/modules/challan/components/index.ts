import { ChallanDetailComponent } from '@modules/challan/components/challan-detail/challan-detail.component';
import { ChallanFormComponent } from '@modules/challan/components/challan-form/challan-form.component';
import { ChallanTableComponent } from '@modules/challan/components/challan-table/challan-table.component';

export const components = [
  ChallanFormComponent,
  ChallanTableComponent,
  ChallanDetailComponent
];
export * from './challan-form/challan-form.component';
export * from './challan-table/challan-table.component';
export * from './challan-detail/challan-detail.component';

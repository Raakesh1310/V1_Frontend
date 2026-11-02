import {
  EscrowPageFieldAadhaarComponent,
  EscrowPageFieldEmailComponent,
  EscrowPageFieldMobileComponent,
  EscrowPageFieldNumberComponent,
  EscrowPageFieldTextComponent,
  EscrowPageWidgetsInputComponent,
  EscrowPageWidgetsPanComponent
} from '@modules/escrow-page-widgets/components';

export const escrowPageWidgets = {
  custom: EscrowPageWidgetsInputComponent,
  pan: EscrowPageWidgetsPanComponent,
  text: EscrowPageFieldTextComponent,
  aadhaar: EscrowPageFieldAadhaarComponent,
  email: EscrowPageFieldEmailComponent,
  mobile: EscrowPageFieldMobileComponent,
  number: EscrowPageFieldNumberComponent
};

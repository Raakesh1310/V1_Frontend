import { MobileEmailVerifyComponent } from './mobile-email-verify/mobile-email-verify.component';
import { BusinessVerifyComponent } from './business-verify/business-verify.component';
import { BusinessDetailsComponent } from './business-details/business-details.component';
import { BusinessKycComponent } from './business-kyc/business-kyc.component';
import { BankDetailsComponent } from './bank-details/bank-details.component';
import { KycDocumentsComponent } from './kyc-documents/kyc-documents.component';
import { SignatoryKycComponent } from './signatory-kyc/signatory-kyc.component';
import { KycSuccessComponent } from './kyc-success/kyc-success.component';
import { DocumentUploadModalComponent } from './document-upload-modal/document-upload-modal.component';
import { DragDirective } from './document-upload-modal/drag.directive';
import { IndividualKycComponent } from './individual-kyc/individual-kyc.component';
import { SelfieKycComponent } from '@modules/kyc-widgets/components/selfie-kyc/selfie-kyc.component';
import { MobileNumberDirective } from './mobile-email-verify/mobileNumber';

export const components = [
  MobileEmailVerifyComponent,
  BusinessVerifyComponent,
  BusinessDetailsComponent,
  BusinessKycComponent,
  BankDetailsComponent,
  KycDocumentsComponent,
  SignatoryKycComponent,
  KycSuccessComponent,
  SelfieKycComponent,
  DocumentUploadModalComponent,
  DragDirective,
  IndividualKycComponent,
  MobileNumberDirective
];

export * from './mobile-email-verify/mobile-email-verify.component';
export * from './business-verify/business-verify.component';
export * from './business-details/business-details.component';
export * from './business-kyc/business-kyc.component';
export * from './bank-details/bank-details.component';
export * from './kyc-documents/kyc-documents.component';
export * from './signatory-kyc/signatory-kyc.component';
export * from './kyc-success/kyc-success.component';
export * from './document-upload-modal/document-upload-modal.component';
export * from './document-upload-modal/drag.directive';
export * from './individual-kyc/individual-kyc.component';
export * from './selfie-kyc/selfie-kyc.component';

import { TransferDocumentService } from '@modules/transfers/services/transfer-document.service';
import { PassbookService } from './passbook.service';

export const services = [PassbookService, TransferDocumentService];

export * from './passbook.service';

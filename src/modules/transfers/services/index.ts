import { BulkTransferService } from './bulk-transfers.service';
import { TransferDocumentService } from './transfer-document.service';
import { TransfersAdminService } from './transferAdmin.service';
import { TransfersService } from './transfers.service';

export const services = [TransfersService, TransfersAdminService, TransferDocumentService, BulkTransferService];

export * from './transfers.service';

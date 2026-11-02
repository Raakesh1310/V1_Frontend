import { DocumentsOverviewComponent } from './documents-overview/documents-overview.component';
import { DocumentsComponent } from './documents/documents.component';
import { DoqfyFormComponent } from './doqfy-form/doqfy-form.component';
import { DoqfyOrderComponent } from './doqfy-order/doqfy-order.component';
import { ListDocumentContainerComponent } from './list-document-container/list-document-container.component';

export const containers = [
  DocumentsComponent,
  DocumentsOverviewComponent,
  DoqfyFormComponent,
  DoqfyOrderComponent,
  ListDocumentContainerComponent
];
export * from './documents/documents.component';
export * from './documents-overview/documents-overview.component';
export * from './doqfy-form/doqfy-form.component';
export * from './doqfy-order/doqfy-order.component';
export * from './list-document-container/list-document-container.component';

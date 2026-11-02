/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as approvalsComponents from './components';

/* Containers */
import * as approvalsContainers from './containers';

/* Guards */
import * as approvalsGuards from './guards';

/* Services */
import * as approvalsServices from './services';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { SingleTransferApprovalComponent } from './components/single-transfer-approval/single-transfer-approval.component';
import { BulkTransferApprovalComponent } from './components/bulk-transfer-approval/bulk-transfer-approval.component';
import { ApprovalOverviewComponent } from './containers/approval-overview/approval-overview.component';
import { ApprovalsComponent } from './containers/approvals/approvals.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BulkApprovalDetailOverviewComponent } from './containers/bulk-approval-detail-overview/bulk-approval-detail-overview.component';
import { BulkApprovalDetailComponent } from './components/bulk-approval-detail/bulk-approval-detail.component';

@NgModule({
    imports: [
        MatDialogModule,
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        AppCommonModule,
        NavigationModule,
    ],
    providers: [...approvalsServices.services, ...approvalsGuards.guards, {
        provide: HTTP_INTERCEPTORS,
        useClass: TokenInterceptor,
        multi: true
      }],
    declarations: [...approvalsContainers.containers, ...approvalsComponents.components, SingleTransferApprovalComponent, BulkTransferApprovalComponent, ApprovalOverviewComponent, ApprovalsComponent, BulkApprovalDetailOverviewComponent, BulkApprovalDetailComponent],
    exports: [...approvalsContainers.containers, ...approvalsComponents.components],
})
export class ApprovalsModule {}

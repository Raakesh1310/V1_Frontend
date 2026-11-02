/* tslint:disable: ordered-imports*/
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IconsModule } from '@modules/icons/icons.module';

const modules = [IconsModule, NgbModule];

/* Containers */
import * as appCommonContainers from './containers';

/* Components */
import * as appCommonComponents from './components';

/* Directives */
import * as appCommonDirectives from './directives';

/* Guards */
import * as appCommonGuards from './guards';

/* Services */
import * as appCommonServices from './services';
import * as authServices from '@modules/auth/services';
import { OtpModalComponent } from '@common/components/otpmodal/otp-modal.component';
import { IdleTimeOutComponent } from '@common/components/idle-time-out/idle-time-out.component';
import { FileUploadComponent } from '@common/components/file-upload/file-upload.component';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { MomentModule } from 'angular2-moment';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  imports: [
    MomentModule,
    NgIdleKeepaliveModule.forRoot(),
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    NgxSpinnerModule,
    NgSelectModule,
    ...modules
  ],
  declarations: [
    ...appCommonContainers.containers,
    ...appCommonComponents.components,
    ...appCommonDirectives.directives,
    OtpModalComponent,
    IdleTimeOutComponent,
    FileUploadComponent
  ],
  exports: [
    ...appCommonContainers.containers,
    ...appCommonComponents.components,
    ...appCommonDirectives.directives,
    ...modules
  ]
})
export class AppCommonModule {
  static forRoot(): ModuleWithProviders<AppCommonModule> {
    return {
      ngModule: AppCommonModule,
      providers: [
        ...appCommonServices.services,
        ...authServices.services,
        ...appCommonGuards.guards,
        { provide: 'window', useValue: window }
      ]
    };
  }
}

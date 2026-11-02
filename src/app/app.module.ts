import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppCommonModule } from '@common/app-common.module';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { TokenInterceptor } from '@common/services/token.interceptor';
import { Account_form_guard } from '@modules/accounts/guards';
import { DeactivateGuard } from '@modules/challan/guards';
import { Escrow_form_guard } from '@modules/escrow-pages/guards/escrow_form_guard';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { Payee_form_guard } from '@modules/payee/guards/payee_form_guard';
import { Transfer_form_guard } from '@modules/transfers/guards/transfer_form_guard';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { PartiesModule } from '@modules/parties/parties.module'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// IDLE timeout modules
// import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
// this includes the core NgIdleModule but includes keepalive providers for easy wireup
// import { MomentModule } from 'angular2-moment'; // optional, provides moment-style pipes for date formatting

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatSliderModule,
    StorageServiceModule,
    AppRoutingModule,
    HttpClientModule,
    AppCommonModule.forRoot(),
    NavigationModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    AngularMultiSelectModule,
    PartiesModule
    // MomentModule,
    // NgIdleKeepaliveModule.forRoot()
  ],
  providers: [
    DeactivateGuard,
    Account_form_guard,
    Payee_form_guard,
    Transfer_form_guard,
    Escrow_form_guard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    { provide: NgbDateParserFormatter, useClass: NgbDateParserService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OtpModalComponent } from '@common/components';
import { AuthService } from '@modules/auth/services';
import {
  Deal,
  DealData,
  DealDocument,
  DealParty,
  dealRoles
} from '@modules/deal/models';
import { DealService } from '@modules/deal/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import smsMsg91TemplateId from 'config/smsMsg91TemplateId';
import { environment } from 'environments/environment';
import _ from 'lodash';

@Component({
  selector: 'sbpro-deal-detail-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deal-detail-admin-page.component.pug',
  styleUrls: ['deal-detail-admin-page.component.scss']
})
export class DealDetailAdminPageComponent implements OnInit {
  deal = {} as Deal;
  dealId = '';
  myRole = dealRoles.Landlord;
  navNames = [
    'Basic Details',
    'Party Details',
    'Property Details',
    'Deal Details'
  ];
  disabledTabs = ['Deal Details', 'Property Details', 'Tenant Details'];
  tabCount = 0;
  loading = false;
  otp = '';

  dealForm: Deal;
  dealparty1Form: DealParty;
  dealparty2Form: DealParty;
  dealDataForm: DealData;

  dealDocument = {} as DealDocument;

  errors = [];

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private dealService: DealService,
    private router: Router,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    private _location: Location
  ) {
    this.activatedRoute.paramMap.subscribe(resp => {
      try {
        if (!resp.get('dealId') || resp.get('dealId') === '') {
          this.goBack();
        }
        this.dealId = resp.get('dealId') || '';
      } catch (e) {
        console.error(e);
      }
    });

    this.dealForm = {} as Deal;
    this.dealDataForm = {} as DealData;
    this.dealparty1Form = {} as DealParty;
    this.dealparty2Form = {} as DealParty;
  }

  ngOnInit() {
    this.dealService.getDealDetails(this.dealId).subscribe(
      (resp: any) => {
        console.log(resp);
        if (resp.success) {
          this.dealDocument = resp.result;
          this.dealForm = resp.result;
          this.dealparty1Form = this.dealDocument.dealParties[0];
          this.dealparty2Form = this.dealDocument.dealParties[1];
          this.dealDataForm = this.dealDocument.dealData;
          this.cdr.detectChanges();
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  setMyRole(role: string) {
    console.log('parent-role --==>>', role);
    this.myRole = role;
    switch (role) {
      case dealRoles.Tenant:
        this.navNames = _.map(this.navNames, elem => {
          return elem === 'Tenant Details' ? 'Landlord Details' : elem;
        });
        this.disabledTabs = _.map(this.disabledTabs, elem => {
          return elem === 'Tenant Details' ? 'Landlord Details' : elem;
        });
        this.dealparty1Form.role = dealRoles.Tenant;
        this.dealparty2Form.role = dealRoles.Landlord;
        break;
      case dealRoles.Landlord:
        this.navNames = _.map(this.navNames, elem => {
          return elem === 'Landlord Details' ? 'Tenant Details' : elem;
        });
        this.disabledTabs = _.map(this.disabledTabs, elem => {
          return elem === 'Landlord Details' ? 'Tenant Details' : elem;
        });
        this.dealparty2Form.role = dealRoles.Tenant;
        this.dealparty1Form.role = dealRoles.Landlord;
        break;
    }
    this.cdr.detectChanges();
    console.log('parent-myrole --==>>', this.myRole);
  }

  patchDeal(props: object) {
    console.log('patching deal with data: ', props);
    this.dealForm = { ...this.dealForm, ...props };
  }

  patchDealData(props: object) {
    console.log('patching dealData with data: ', props);
    this.dealDataForm = { ...this.dealDataForm, ...props };
  }

  patchDealParty1(props: object) {
    console.log('patching dealParty1 with data: ', props);
    this.dealparty1Form = { ...this.dealparty1Form, ...props };
  }

  patchDealParty2(props: object) {
    console.log('patching dealParty2 with data: ', props);
    this.dealparty2Form = { ...this.dealparty2Form, ...props };
  }

  nextTab(event: boolean) {
    if (event) {
      if (this.disabledTabs.length > 0) {
        this.disabledTabs.pop();
      }
      this.tabCount += 1;
    }
  }

  submitDeal() {
    this.loading = true;
    console.log('preparing api data');

    const sd: any = this.dealForm.startDate;
    this.dealForm.startDate = new Date(
      sd.year,
      sd.month - 1,
      sd.day
    ).toISOString();
    const ed: any = this.dealForm.endDate;
    this.dealForm.endDate = new Date(
      ed.year,
      ed.month - 1,
      ed.day
    ).toISOString();

    const dealData = this.dealDataForm;
    const dealParties: Array<DealParty> = [];
    dealParties.push(this.dealparty1Form);
    dealParties.push(this.dealparty2Form);

    const modalRef: NgbModalRef & {
      componentInstance: OtpModalComponent;
    } = this.modalService.open(OtpModalComponent, {
      backdrop: 'static',
      size: 'md'
    });
    modalRef.componentInstance.doClose = modalRef;
    modalRef.componentInstance.templateId =
      smsMsg91TemplateId.registerMobileOtp;
    modalRef.componentInstance.passOtp.subscribe((otp: number) => {
      if (otp) {
        const apiData = {
          otp,
          ...this.dealForm,
          dealParties,
          dealData
        };

        this.dealService.createDeal(apiData).subscribe(
          resp => {
            this.loading = false;
            this.router.navigate([environment.urlPortalPrefix + '/deal', {}]);
            this.cdr.detectChanges();
          },
          err => {
            this.loading = false;
            this.errors = err.error.errors;
            this.cdr.detectChanges();
          }
        );
      } else {
        console.log('something went wrong with modal');
      }
    });
  }

  goBack() {
    this._location.back();
  }
}

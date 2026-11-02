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
  selector: 'sbpro-deal-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deal-form-page.component.pug',
  styleUrls: ['deal-form-page.component.scss']
})
export class DealFormPageComponent implements OnInit {
  deal = {} as Deal;
  myRole = dealRoles.Landlord;
  navNames = [
    'Basic Details',
    'Tenant Details',
    'Property Details',
    'Deal Details'
  ];
  disabledTabs = ['Deal Details', 'Property Details', 'Tenant Details'];
  tabCount = 0;
  maxTabCount = 3;
  loading = false;
  otp = '';
  dealId = '';
  isEditDeal = false;
  dealForm: Deal;
  dealparty1Form: DealParty;
  dealparty2Form: DealParty;
  dealDataForm: DealData;
  dealDocument = {} as DealDocument;
  errors: string[] = [];

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
    this.dealForm = {} as Deal;
    this.dealDataForm = {} as DealData;
    this.dealparty1Form = {} as DealParty;
    this.dealparty2Form = {} as DealParty;
    this.activatedRoute.paramMap.subscribe(resp => {
      try {
        if (!resp.get('dealId') || resp.get('dealId') === '') {
          console.log('No Deal Id found');
        }
        this.dealId = resp.get('dealId') || '';
      } catch (e) {
        console.error(e);
      }
    });
  }

  ngOnInit() {
    if (this.dealId) {
      this.dealService.getDealDetails(this.dealId).subscribe(
        (resp: any) => {
          console.log(resp);
          if (resp.success) {
            this.dealDocument = resp.result;
            if (
              this.dealDocument.dealParties[0].email ==
              this.authService.getEmail()
            ) {
              this.dealparty1Form = this.dealDocument.dealParties[0];
              this.dealparty2Form = this.dealDocument.dealParties[1];
            } else {
              this.dealparty1Form = this.dealDocument.dealParties[1];
              this.dealparty2Form = this.dealDocument.dealParties[0];
            }
            this.dealDataForm = this.dealDocument.dealData;
            this.disabledTabs = [];
            this.isEditDeal = true;
            this.cdr.detectChanges();
          }
        },
        err => {
          console.log(err);
        }
      );
    }
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

  setTab(event: number) {
    this.tabCount = event;
  }

  nextTab(event: boolean) {
    if (event) {
      if (this.disabledTabs.length > 0) {
        this.disabledTabs.pop();
      }
      this.tabCount =
        this.tabCount < this.maxTabCount ? this.tabCount + 1 : this.tabCount;
    }
  }

  async isDealUnApproved() {
    return new Promise((resolve, reject) => {
      this.dealService.getDealDetails(this.dealId).subscribe(
        (resp: any) => {
          console.log(resp);
          if (resp.success) {
            if (resp.result.status === 'Pending for approval') {
              resolve(true);
            }
            reject(false);
          }
        },
        err => {
          console.log(err);
          reject(false);
        }
      );
    });
  }

  submitDeal() {
    this.loading = true;
    console.log('preparing api data');
    console.log(this.dealForm);

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
    modalRef.componentInstance.passOtp.subscribe(async (otp: number) => {
      if (otp) {
        const apiData = {
          otp,
          ...this.dealForm,
          dealParties,
          dealData
        };

        if (this.isEditDeal) {
          const isDealUnApproved = await this.isDealUnApproved().catch(
            error => {
              this.loading = false;
              this.errors = ['Deal has been modified, cannot edit.'];
              this.cdr.detectChanges();
            }
          );

          if (isDealUnApproved) {
            this.dealService.updateDeal(apiData, this.dealId).subscribe(
              resp => {
                this.loading = false;
                this.router.navigate([
                  environment.urlPortalPrefix + '/deal',
                  {}
                ]);
                this.cdr.detectChanges();
              },
              err => {
                this.loading = false;
                this.errors = err.error.errors;
                this.cdr.detectChanges();
              }
            );
          }
        } else {
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
        }
      } else {
        console.log('something went wrong with modal');
      }
    });
  }
}

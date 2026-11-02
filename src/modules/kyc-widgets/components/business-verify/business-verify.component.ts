import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import {
  kycDataModel,
  options,
  promoterDetails
} from '@modules/kyc-widgets/models';
import { KycWidgetsService } from '@modules/kyc-widgets/services';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'sbpro-business-verify',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './business-verify.component.pug',
  styleUrls: ['./business-verify.component.scss']
})
export class BusinessVerifyComponent implements OnInit {
  options: options[] = [];
  componentToRender = 'Business Details';
  kycAllDetailsVerified = false;
  kycType = 'All';
  crnId = '';
  data!: kycDataModel;
  //renderKycTemplates = false;
  isLoading = true;
  errors: string[] = [];
  gstAvailable = true;
  businessType = '';
  constructor(
    private cdr: ChangeDetectorRef,
    private kycService: KycWidgetsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Routing data ' + this.route.snapshot.params.crnId);
    this.crnId = this.route.snapshot.params.crnId;
    this.isLoading = true;
    this.route.queryParams.subscribe((params: any) => {
      console.log('Params Data ', params);
      // if(params.allDetailsVerified === "true") {
      //   this.kycAllDetailsVerified = true;
      // }else {
      this.kycType = params.kycType === 'Company' ? 'All' : params.kycType;
      //this.changeComponent(params.page);
      //}
    });
    this.individualKyc(this.kycType);
    this.getKycData();
    // this.options = [
    //   {
    //     isSelected: true,
    //     text: 'Business Details',
    //     value: 1
    //   },
    //   {
    //     isSelected: false,
    //     text: 'Business KYC',
    //     value: 2
    //   },
    //   {
    //     isSelected: false,
    //     text: 'Bank Details',
    //     value: 3
    //   },
    //   {
    //     isSelected: false,
    //     text: 'Signatory KYC',
    //     value: 4
    //   },
    //   {
    //     isSelected: false,
    //     text: 'Documents',
    //     value: 5
    //   }
    // ];
  }

  getKycData() {
    // @ts-ignore
    this.data = {};
    let params = {};
    let url = environment.apiPrefix + `/kyclink/${this.crnId}`;
    // this.errors = [];
    // this.isLoading = true;
    // let url = this.adminCheck();
    this.kycService.getKycData(url, params).subscribe(
      (resp: any) => {
        console.log('USER KYC DETAIL ', resp);
        if (resp.success) {
          this.data = this.kycService.kycDataMapping(resp.result);
          this.gstAvailable = this.data.gstAvailable;
          this.businessType = this.data.businessType;
          if (this.data.status === 'Completed') {
            this.kycAllDetailsVerified = true;
          } else {
            if (this.data.page) {
              this.changeComponent(this.data.page || 'Business Details');
            } else {
              if (this.data.businessType === 'Individual') {
                this.changeComponent('KYC Details');
              } else {
                this.changeComponent('Business Details');
              }
            }
          }
          //this.kycType = this.data.businessType;
          this.isLoading = false; // this will send data to parent Component
          console.log(this.data);
        } else {
          console.log('ERROR ', resp.errors);
        }
        this.cdr.detectChanges();
      },
      err => {
        this.isLoading = false;
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
        } else {
          console.log(err.error.errors);
          this.errors.push(err.error.errors);
        }
        this.cdr.detectChanges();
      }
    );
  }

  kycDataUpgraded(data: kycDataModel) {
    //console.log("UPGRADED DATA ",data);
    this.data = data;
    this.cdr.detectChanges();
  }

  changeComponent(componentName: string) {
    // if (componentName === 'Business Details') {
    //   this.ngOnInit();
    // }
    console.log('HHHHHHHHBBB ', componentName, this.options);
    this.componentToRender = componentName;
    this.options.forEach(val => {
      val.isSelected = val.text === componentName;
    });
    this.cdr.detectChanges();
  }

  renderSuccess(val: boolean) {
    //this.cdr.detectChanges();
    let body = {
      status: 'Completed'
    };
    let params = {};
    let url = environment.apiPrefix + `/kyclink/${this.crnId}`;
    this.errors = [];
    this.kycService.patchKycData(this.crnId, body, params).subscribe(
      (resp: any) => {
        console.log('DATA AFTER SUCCESSFUL KYC ', resp);
        if (resp.success) {
          let kycData: kycDataModel = this.kycService.kycDataMapping(
            resp.result
          );
          this.router
            .navigate(['/kyc/success' + '/' + this.crnId])
            .then(r => r);
          this.cdr.detectChanges();
        } else {
          // this.isLoading = false;
          // this.errors.push(resp.errors);
          this.cdr.detectChanges();
          console.log('ERROR ', resp.errors);
        }
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
          this.errors.push('Connection Error');
        } else {
          console.log(err.error.errors);
          this.errors.push(err.error.errors);
        }
        this.cdr.detectChanges();
      }
    );
  }

  /**
   * This function will render template according to Individual Kyc...
   */
  individualKyc(type: string) {
    this.kycType = type;
    if (type === 'Individual') {
      this.options = [
        {
          isSelected: false,
          text: 'KYC Details',
          value: 1
        },
        {
          isSelected: false,
          text: 'Bank Details',
          value: 2
        }
      ];
    } else {
      this.options = [
        {
          isSelected: true,
          text: 'Business Details',
          value: 1
        },
        {
          isSelected: false,
          text: 'Business KYC',
          value: 2
        },
        {
          isSelected: false,
          text: 'Bank Details',
          value: 3
        },
        {
          isSelected: false,
          text: 'Signatory KYC',
          value: 4
        },
        {
          isSelected: false,
          text: 'Documents',
          value: 5
        }
      ];
    }
    this.cdr.detectChanges();
  }
}

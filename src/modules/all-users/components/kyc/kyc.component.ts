import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { AuthService } from '@modules/auth/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService, UtilityService } from '@common/services';
import { AllUsersService } from '@modules/all-users/services';
import { KycLinkInterface, KycSubmitInterface } from '../../models/kyc-model';
import * as date from 'date-and-time';

enum businessTypes {
  Business = 'Business',
  Company = 'Company',
  Individual = 'Individual'
}

@Component({
  selector: 'sbpro-kyc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kyc.component.pug',
  styleUrls: ['kyc.component.scss']
})
export class KycComponent implements OnInit {
  descForm!: FormGroup;
  total$!: number;
  errors: string[] = [];
  data: any = [];
  name = '';
  email = '';
  searchTerm = '';
  selectedStatus = '';
  page = 1;
  pageSize = 10;
  private modalRef?: NgbModalRef;
  private statusList = ['Sent', 'In Progress', 'Completed'];
  private isSuperAdmin = false;
  kycType = 'Individual';
  downloadLink = '';
  private logo?: File;
  selectedKYCLink: any = null;

  @ViewChild('inputLogo') inputLogo!: ElementRef;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private httpClient: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private allUserService: AllUsersService,
    private utilityService: UtilityService
  ) {
    this.isSuperAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit() {
    //console.log(this.authService.getBearerToken());
    this.descForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    this.searchTerm = '';
    this.page = 1;
    this.getTableEntries({ page: this.page });
    this.updateDownloadLink();
    this.selectedStatus = '';
    this.cdr.detectChanges()
  }

  get emailControl() {
    return this.descForm.get('email') as FormControl;
  }

  get emailControlValid() {
    return this.emailControl.touched && !this.emailControlInvalid;
  }

  get emailControlInvalid() {
    return (
      this.emailControl.touched &&
      (this.emailControl.hasError('required') ||
        this.emailControl.hasError('email'))
    );
  }

  openModal(alertDialog: any) {
    this.modalRef = this.modalService.open(alertDialog, {
      backdrop: 'static',
      centered: true
    });
  }

  openStatusMapModal(alertDialog: any) {
    console.log(this.selectedKYCLink);
    if (this.selectedKYCLink.statusMilestone) {
      this.modalRef = this.modalService.open(alertDialog, {
        backdrop: 'static',
        centered: true
      });
    } else {
      let toastHead = 'Failure';
      let toastBody = `Cannot fetch KYC milestones details.`;
      this.showToast(toastHead, toastBody, {
        headerClasses: 'bg-danger text-white'
      });
    }
  }

  closeModal() {
    this.errors = [];
    this.descForm.reset();
    this.modalRef?.close();
  }

  setPages(value: string) {
    console.log(value);
    this.kycType = value;
    this.cdr.detectChanges();
  }

  /**
   * Calls api when page changes.
   */
  pageChange(event: any) {
    console.log('PAGE ', this.page);
    console.log('PAGE EVENT ', event);
    const params: any = { page: this.page };
    // this.enableEdit = false;
    // this.enableEditIndex = null;
    // if (this.startDate?.year > 2010) {
    //   params.dateFrom = new Date(
    //     this.dateParser.format(this.startDate)
    //   ).toISOString();
    // }
    // if (this.endDate?.year > 2010) {
    //   params.dateTo = new Date(
    //     this.dateParser.format(this.endDate)
    //   ).toISOString();
    // }
    if (this.searchTerm.length > 0) {
      params.s = this.searchTerm.trim();
    }
    this.getTableEntries(params);
    //this.cdr.detectChanges();

    this.updateDownloadLink();
  }

  /**
   * Get table data.
   */
  loadData() {
    console.log(this.selectedStatus);
    const params: any = { page: this.page };
    if (this.searchTerm) {
      params.s = this.searchTerm.trim();
    }
    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }
    this.getTableEntries(params);
  }

  updateDownloadLink() {
    console.log(this.selectedStatus);
    const params: any = {
      token: this.authService.getBearerToken(),
      page: this.page
    };

    if (this.searchTerm) {
      params.s = this.searchTerm.trim();
    }

    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

    let paramsSerialized = '';

    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }
    this.downloadLink =
      environment.apiPrefix +
      (this.isSuperAdmin
        ? '/super-admin/kyclink/download?'
        : '/kyclink/download?') +
      paramsSerialized;

    this.cdr.detectChanges();
  }

  /**
   * Getting data.
   */
  getTableEntries(params: object) {
    console.log('GETTING DATA....');
    this.allUserService.getKycTableEntries(params, this.isSuperAdmin).subscribe(
      (resp: any) => {
        console.log('RESPONSE ', resp);
        if (resp.success) {
          this.data = resp.result;
          for (let data of this.data) {
            try {
              data.createdAt = date.format((new Date(data.createdAt)), 'YYYY-MM-DD');
            } catch (err) {
              console.log('ERROR', err);
            };
          }
          this.total$ = resp.allItemsCount;
          this.updateDownloadLink();
          this.cdr.detectChanges();
        } else {
          console.log('ERROR ', resp);
        }
      },
      (err: any) => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
        } else {
          console.log(err.error.errors);
        }
        this.cdr.detectChanges();
      }
    );
  }

  showStatus(event: any) {
    console.log(event.target.value);
  }

  /**
   * Generating new kyc request.
   */
  onSubmit() {
    this.errors = [];
    let body: KycSubmitInterface = {
      name: this.descForm.controls.name.value,
      email: this.descForm.controls.email.value,
      businessType:
        this.kycType === businessTypes.Business
          ? businessTypes.Company
          : businessTypes.Individual
    };
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]: any[]) => {
      formData.set(key, value);
    });

    //Add logo file if given
    if (this.logo) {
      formData.set('file', this.logo);
    }

    if (this.descForm.controls.email.value === '') {
      this.errors = ['Email is required'];
      this.cdr.detectChanges();
      return;
    }

    if (this.descForm.controls.name.value === '') {
      this.errors = ['Name is required'];
      this.cdr.detectChanges();
      return;
    }

    this.allUserService.createKYCLink(formData, this.isSuperAdmin).subscribe(
      (resp: any) => {
        console.log('Response from API', resp);
        if (resp.success) {
          let toastHead = 'Success';
          let toastBody = `KYC link successfully send`;
          this.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
          this.data.unshift(resp.result);
          this.data.pop();
          this.descForm.reset();
          this.email = '';
          this.name = '';
          this.getTableEntries({ page: this.page });
          this.cdr.detectChanges();
        }
        this.closeModal();
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        let toastHead = 'Error';
        let toastBody = '';
        if (err.status === 0) {
          this.errors = ['Connection Error'];
          toastBody = 'Connection Error';
        } else {
          this.errors = err.error.errors;
          toastBody = err.error.errors;
        }
        this.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.closeModal();
        this.cdr.detectChanges();
      }
    );
  }

  moveToDetails(value: String) {
    this.router
      .navigate(
        [
          (this.isSuperAdmin
            ? environment.urlAdminPrefix + `/alluserskyc/`
            : environment.urlPortalPrefix + `/userskyc/`) + value
        ],
        {}
      )
      .then(r => r);
  }

  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 5000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }

  /**
   * Click Logo Upload button
   */
  selectLogo() {
    this.inputLogo.nativeElement.click();
  }

  /**
   * Upload Image
   */
  uploadImage(event: Event) {
    const formData = new FormData();
    let files = (event.target as HTMLInputElement).files;
    this.logo = files![0];
    this.cdr.detectChanges();
  }

  /**
   * Creating Merchant if kyc is completed.
   */
  sendLink(crnId: string) {
    this.allUserService.createMerchantFromKyc(crnId).subscribe(
      (resp: any) => {
        if (resp.success) {
          let objIndex = this.data.findIndex(
            (obj: KycLinkInterface) => obj.crnId == crnId
          );
          this.data[objIndex].status = 'Merchant Created';
          let toastHead = 'Success';
          let toastBody = `Successfully Created Merchant`;
          this.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
          this.cdr.detectChanges();
        } else {
          let toastHead = 'Failed';
          let toastBody = `Failed to create Merchant`;
          this.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
        }
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        let toastHead = 'Error';
        let toastBody = '';
        if (err.status === 0) {
          this.errors = ['Connection Error'];
          toastBody = 'Connection Error';
        } else {
          this.errors = err.error.errors;
          toastBody = err.error.errors;
        }
        this.showToast(toastHead, toastBody, {
          headerClasses: 'bg-danger text-white'
        });
        this.closeModal();
        this.cdr.detectChanges();
      }
    );
  }
}

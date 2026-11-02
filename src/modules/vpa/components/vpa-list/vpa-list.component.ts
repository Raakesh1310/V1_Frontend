import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { AccountsService } from '@modules/accounts/services';
import { AuthService } from '@modules/auth/services';
import { QRDetails } from '@modules/escrow-qr/models/vpa-details.model';
import { VpaService } from '@modules/vpa/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import vpaStatuses from '../../constants/vpa-status.constant';
import * as htmlToImage from 'html-to-image';

@Component({
  selector: 'sbpro-vpa-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vpa-list.component.pug',
  styleUrls: ['vpa-list.component.scss']
})
export class VpaListComponent implements OnInit {
  vpaList = [];
  errors: string[] = [];
  total!: number;
  page: number = 1;
  pageSize: number = 10;
  downloadLink = '';
  statusList = [vpaStatuses.PENDING, vpaStatuses.ACTIVE, vpaStatuses.INACTIVE];
  status = '';
  selectedStatus: string = '';
  searchTerm: string = '';
  isChecked = false;
  verificationIdMap = new Map();
  selectedForOperation = 0;
  qrCode = '';
  vpa = '';
  // qrAmount: number | null = null;
  merchantName!: string;
  upiId = '';
  detailsModal?: NgbModalRef;
  actionList: string[] = [];
  modalRef?: NgbModalRef;
  @ViewChild('detailsTemplate')
  private detailsTemplate!: TemplateRef<any>;
  @ViewChild('alert') alert!: HTMLTemplateElement;
  isAdmin: boolean = false;

  phonepe = '../../../../assets/img/payment_app_logos/PhonePe-Logo.wine.png';
  paytm = '../../../../assets/img/payment_app_logos/Paytm-Logo.wine.png';
  gpay = '../../../../assets/img/payment_app_logos/Google_Pay-Logo.wine.png';
  rbl = '../../../../assets/img/rbl.png';

  @ViewChild('screen') screen: any;

  constructor(
    private vpaService: VpaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    public accountsService: AccountsService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
  }

  ngOnInit() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.isChecked = false;
    this.getAllVPAs({ page: this.page });
    this.updateDownloadLink();
    this.verificationIdMap = new Map();
    this.isChecked = false;
    this.actionList = ['Activate', 'Deactivate'];
  }

  selectAll(event: any) {
    console.log(event.currentTarget.checked);
    this.vpaList.forEach((vpa: any) => {
      if (vpa.status === vpaStatuses.PENDING) {
        this.alterMapValue(event, vpa);
      }
    });
    this.selectedForOperation = this.verificationIdMap.size;
    this.cdr.detectChanges();
  }

  openModal(alertDialog: any, event: any) {
    this.errors = [];
    //this.dialog.open(alertDialog);
    console.log(event.target.value);
    if (this.vpaList.length === 0) {
      this.errors.push('No Entries found.');
      return;
    }
    // if (
    //   event.target.value === 'Activate' ||
    //   event.target.value === 'Deact'
    // ) {
    //   this.errors.push('Please select at least one entry.');
    //   return;
    // }
    if (event.target.value !== '') {
      // setting selected status value..
      this.selectedStatus = event.target.value;
      // .replace('(', '')
      // .replace(')', '');
      this.modalRef = this.modalService.open(alertDialog, {
        backdrop: 'static',
        centered: true
      });
    }
    this.cdr.detectChanges();
  }

  selectedStatusChanged(status: string) {
    this.selectedStatus = status;
    this.updateDownloadLink();
    this.cdr.detectChanges();
  }

  getAllVPAs(params: object) {
    this.vpaService.getAllVPAs(params).subscribe(
      (resp: any) => {
        if (resp.success) {
          if (resp.result) {
            this.vpaList = resp.result;
            resp.result.forEach((data: any) => {
              data['isSelected'] = this.verificationIdMap.has(data.vpa);
            });

            this.total = resp.allItemsCount;
            this.cdr.detectChanges();
          }
        }
      },
      error => {
        this.errors = error;
      },
      () => {
        // 'onCompleted' callback.
        // No errors, route to new page here
      }
    );
  }

  public getQRCode(accountId: string) {
    this.accountsService.getQRCode(accountId).subscribe((resp: any) => {
      if (resp.success) {
        if (resp.result.qrCode.length > 0) {
          this.qrCode = resp.result.qrCode;
        }
      }
    });
  }

  openQRModal(modal: TemplateRef<any>) {
    this.detailsModal = this.modalService.open(modal, {
      backdrop: 'static',
      size: 'md'
    });
  }

  showQRCode(vpaDetails: QRDetails) {
    this.spinner.show();
    this.getQRCode(vpaDetails.accountId);
    this.qrCode = vpaDetails.qr;
    this.vpa = vpaDetails.vpa;
    this.merchantName = vpaDetails.merchantName;
    this.openQRModal(this.detailsTemplate);
    this.cdr.detectChanges();
    this.spinner.hide();
  }

  onCancel() {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.detailsModal?.close();
    this.cdr.detectChanges();
  }

  /**
   * Download QR Code
   * @param upiId
   */
  downloadQR(upiId: string) {
    htmlToImage
      .toPng(document.getElementById('screen') as HTMLElement)
      .then(function(dataUrl) {
        var link = document.createElement('a');
        link.download = upiId + '.png';
        link.href = dataUrl;
        link.click();
      });
  }

  updateDownloadLink() {
    const params: any = {
      token: this.authService.getBearerToken(),
      page: -1
    };

    if (this.searchTerm.length > 0) {
      params.s = this.searchTerm.trim();
    }

    if (this.selectedStatus !== '') {
      params.status = this.selectedStatus;
    }

    let paramsSerialized = '';

    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }
    this.downloadLink = this.isAdmin
      ? environment.apiPrefix +
        '/super-admin/vpa/report/download?' +
        paramsSerialized
      : environment.apiPrefix + '/vpa/report/download?' + paramsSerialized;

    this.cdr.detectChanges();
  }

  filterData() {
    this.errors = [];
    this.isChecked = false;

    const params: any = {};

    if (this.searchTerm.length > 0) {
      params.s = this.searchTerm.trim();
    }

    if (this.selectedStatus !== '') {
      params.status = this.selectedStatus;
    }
    this.page = 1;

    this.getAllVPAs(params);
  }

  pageChange(event: any) {
    const params: any = { page: this.page };
    this.isChecked = false;
    if (this.searchTerm.length > 0) {
      params.s = this.searchTerm.trim();
    }

    if (this.selectedStatus !== '') {
      params.status = this.selectedStatus;
    }

    this.getAllVPAs(params);
  }

  alterMapValue(event: any, vpaEntry: any) {
    if (event.currentTarget.checked) {
      this.verificationIdMap.set(vpaEntry.vpa, event.currentTarget.checked);
    } else {
      if (this.verificationIdMap.has(vpaEntry.vpa)) {
        this.verificationIdMap.delete(vpaEntry.vpa);
      }
    }
    this.cdr.detectChanges();
  }

  checkValue(event: any, vpa: any) {
    this.alterMapValue(event, vpa);
    this.selectedForOperation = this.verificationIdMap.size;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.modalRef?.close();
    this.cdr.detectChanges();
    //this.ngOnInit();
  }

  sendSingleApprovals() {
    this.errors = [];

    let verificationIds: string[] = [];
    for (let key of this.verificationIdMap.keys()) {
      verificationIds.push(key.toString());
    }

    this.vpaService
      .activate({ vpas: verificationIds, action: this.selectedStatus })
      .subscribe(
        (resp: any) => {
          if (resp.success) {
            this.closeModal();
            // this.page = 1;
            this.ngOnInit();
          } else {
            // this.errors.push(resp.errors);
            console.log('ERROR ', resp.errors);
          }
          // this.disableStatusButton = false;
          this.cdr.detectChanges();
        },
        (err: any) => {
          // this.isLoading = false;

          if (err.status === 0) {
            console.log('Connection Error');
            // this.errors.push('Connection Error');
          } else {
            console.log(err.error.errors);
            // this.errors.push(err.error.errors);
          }
          // this.closeModal();
          // this.disableStatusButton = false;
          this.cdr.detectChanges();
        }
      );
  }

  viewDetails(id: string) {
    if (this.isAdmin) {
      this.router.navigate([environment.urlAdminPrefix + '/escrow/' + id]);
    } else {
      this.router.navigate([environment.urlPortalPrefix + '/escrow/' + id]);
    }
  }

  viewMerchantDetails(id: string) {
    if (this.isAdmin) {
      this.router.navigate([environment.urlAdminPrefix + '/merchant/' + id]);
    }
  }
}

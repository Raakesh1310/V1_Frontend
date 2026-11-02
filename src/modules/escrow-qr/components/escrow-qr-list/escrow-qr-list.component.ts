import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilityService } from '@common/services';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { Account } from '@modules/accounts/models';
import { AccountsService } from '@modules/accounts/services';
import { Merchant } from '@modules/auth/models/merchant.model';
import { AuthService } from '@modules/auth/services';
import { EscrowQrService } from '@modules/escrow-qr/services';
import {
  NgbDateStruct,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Location } from '@angular/common';
import { QRDetails } from '../../models/vpa-details.model';
import * as htmlToImage from 'html-to-image';

@Component({
  selector: 'sbpro-escrow-qr-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escrow-qr-list.component.pug',
  styleUrls: ['escrow-qr-list.component.scss']
})
export class EscrowQrListComponent implements OnInit {
  isAdmin = false;
  qrCode = '';
  vpa = '';
  accounts!: Account[];
  selectedAccount!: Account | null;
  fixedAmount: string = 'yes';
  amount!: number;
  purpose!: string;
  escrowQRList: any = [];
  errors: string[] = [];
  qrAmount: number | null = null;
  merchantName!: string;
  total!: number;
  page: number = 1;
  pageSize: number = 10;
  // downloadLink = '';
  detailsModal?: NgbModalRef;
  @ViewChild('detailsTemplate')
  private detailsTemplate!: TemplateRef<any>;
  @ViewChild('formTemplate')
  private formTemplate!: TemplateRef<any>;
  searchTerm: string = '';
  startDate!: NgbDateStruct;
  endDate!: NgbDateStruct;
  startTimeStamp = 0;
  endTimeStamp = 0;
  maxDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getUTCDate()
  };
  escrowQRForm!: FormGroup;
  merchants: Merchant[] = [];
  selectedMerchant: any;
  phonepe = '../../../../assets/img/payment_app_logos/PhonePe-Logo.wine.png';
  paytm = '../../../../assets/img/payment_app_logos/Paytm-Logo.wine.png';
  gpay = '../../../../assets/img/payment_app_logos/Google_Pay-Logo.wine.png';
  rbl = '../../../../assets/img/rbl.png';

  @ViewChild('screen') screen: any;

  constructor(
    private _location: Location,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private dateParser: NgbDateParserService,
    private escrowQRService: EscrowQrService,
    private accountService: AccountsService,
    private authService: AuthService,
    private router: Router,
    private utilService: UtilityService
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
    this.errors = [];
  }

  ngOnInit() {
    this.getEscrowQRList({ page: this.page });
    this.startDate = { year: 0, day: 0, month: 0 };
    this.endDate = { year: 0, day: 0, month: 0 };
    this.searchTerm = '';

    // initialize form
    this.escrowQRForm = this.formBuilder.group({
      merchantId: [this.selectedMerchant, Validators.required],
      accountId: [this.selectedAccount, Validators.required],
      fixedAmount: [this.fixedAmount, Validators.required],
      amount: [this.amount],
      purpose: [this.purpose]
    });

    if (this.isAdmin) {
      this.getMerchants('');
    }

    this.cdr.detectChanges();
  }

  // downloadImage() {
  //   html2canvas(this.screen.nativeElement).then(canvas => {
  //     this.canvas.nativeElement.src = canvas.toDataURL();
  //     this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
  //     this.downloadLink.nativeElement.download = 'marble-diagram.png';
  //     this.downloadLink.nativeElement.click();
  //   });
  // }

  getMerchants(searchTerm: string) {
    this.escrowQRService
      .getUPILinkedMerchants(searchTerm)
      .subscribe((resp: any) => {
        if (resp?.success) {
          this.merchants = resp.result;
          this.cdr.detectChanges();
        }
      });
  }

  updateMerchant(event: any) {
    let s = event;
    this.escrowQRForm.controls.merchantId.setValue(
      this.selectedMerchant?.merchantId
    );

    this.escrowQRForm.controls.accountId.reset();
    this.selectedAccount = null;

    this.escrowQRService
      .getUPILinkedAccounts(this.selectedMerchant?.merchantId, s)
      .subscribe((resp: any) => {
        if (resp.success) {
          this.accounts = resp.result;
        }
      });

    this.cdr.detectChanges();
  }

  getEscrowQRList(params: object) {
    this.spinner.show();
    this.escrowQRService.getEscrowQrList(params).subscribe(
      (resp: any) => {
        if (resp.success) {
          if (resp.result) {
            this.escrowQRList = resp.result;
            this.total = resp.allItemsCount;
            console.log(this.escrowQRList);
            this.spinner.hide();
            this.cdr.detectChanges();
          }
        }
      },
      error => {
        this.errors = error;
        this.spinner.hide();
        this.cdr.detectChanges();
      },
      () => {
        // 'onCompleted' callback.
        // No errors, route to new page here
      }
    );
  }

  startDateChange() {
    //console.log("EVENT ",event);
    console.log('DATE Start ', this.startDate);
    let date = new Date(
      this.startDate.year,
      this.startDate.month - 1,
      this.startDate.day,
      new Date().getHours(),
      new Date().getMinutes(),
      new Date().getSeconds()
    );
    this.startTimeStamp = date.getTime();
    console.log('TIMESTAMP 1 ', date.getTime());
  }

  endDateChange() {
    //console.log("EVENT ",event);
    console.log('DATE End ', this.endDate);
    let date = new Date(
      this.endDate.year,
      this.endDate.month - 1,
      this.endDate.day,
      new Date().getHours(),
      new Date().getMinutes(),
      new Date().getSeconds()
    );
    this.endTimeStamp = date.getTime();
    console.log('TIMESTAMP 2 ', date.getTime());
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

  openQRModal(modal: TemplateRef<any>, size: string = 'md') {
    this.detailsModal = this.modalService.open(modal, {
      backdrop: 'static',
      size: size
    });
  }

  showQRCode(vpaDetails: QRDetails) {
    this.spinner.show();
    this.qrCode = vpaDetails.qr;
    this.vpa = vpaDetails.vpa;
    this.qrAmount = vpaDetails.amount ? vpaDetails.amount : null;
    this.merchantName = vpaDetails.merchantName;
    this.openQRModal(this.detailsTemplate);
    this.cdr.detectChanges();
    this.spinner.hide();
  }

  showForm() {
    this.spinner.show();
    this.openQRModal(this.formTemplate, 'md');
    // this.accountService.performSearch(accountsStatus.ACTIVE, 'rbl');
    this.escrowQRService.getUPILinkedAccounts().subscribe((resp: any) => {
      this.accounts = resp.result;
    });
    this.cdr.detectChanges();
    this.spinner.hide();
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

  filterData() {
    this.errors = [];
    console.log('FILTERING DATA ');
    const params: any = {};

    if (this.startDate?.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this.startDate)
      ).toISOString();
    }
    if (this.endDate?.year > 2010) {
      params.dateTo = new Date(
        this.dateParser.format(this.endDate)
      ).toISOString();
    }
    if (this.searchTerm.length > 0) {
      params.s = this.searchTerm.trim();
    }

    this.page = 1;

    console.log('PARAMS ', params);
    this.getEscrowQRList(params);
  }

  pageChange(event: any) {
    console.log('PAGE ', this.page);
    console.log('PAGE EVENT ', event);
    const params: any = { page: this.page };
    if (this.searchTerm.length > 0) {
      params.s = this.searchTerm.trim();
    }

    this.getEscrowQRList(params);
  }

  // fetch account on each key hit
  // fetchAccount($event: any) {
  //   let s = $event.term;
  //   // this.accountService.performSearch();

  //   // this.accountService.account$.subscribe(resp => {
  //   //   this.accounts = resp;
  //   //   this.cdr.detectChanges();
  //   // });
  //   this.escrowQRService.getUPILinkedAccounts(s).subscribe((resp: any) => {
  //     if (resp.success) {
  //       this.accounts = resp.result;
  //     }
  //   });
  //   this.cdr.detectChanges();
  // }

  // when a account is selected
  updateAccount(event: any) {
    console.log('ACCOUNT ', event);
    // set form controls
    // this.transferForm.controls.account.setValue(event.accountId);
    this.selectedAccount = event;

    console.log('SELECTED ACCOUNT ', this.selectedAccount);
    //Check if YES Bank then Profile needs to be fetched

    this.cdr.detectChanges();
  }

  amountChanged(event: any) {
    console.log('AMOUNT ', event.target.value);
    this.amount = event.target.value;
    this.escrowQRForm.controls.amount.setValue(event.target.value);
    return this.utilService.onlyNumeric(event);
  }

  createEscrowQR() {
    this.spinner.show();
    // this.cdr.detectChanges()
    if (this.isAdmin && (!this.selectedMerchant || !this.selectedAccount)) {
      this.errors = ['Please fill in the mandatory feilds.'];
      this.spinner.hide();
      this.cdr.detectChanges();
      return;
    }

    if (!this.isAdmin && !this.selectedAccount) {
      this.errors = ['Please fill in the mandatory feilds.'];
      this.spinner.hide();
      this.cdr.detectChanges();
      return;
    }

    if (
      (this.fixedAmount === 'yes' && !this.amount) ||
      (this.fixedAmount === 'yes' && this.amount <= 0)
    ) {
      this.errors = ['Please enter a valid amount.'];
      this.spinner.hide();
      this.cdr.detectChanges();
      return;
    }

    this.escrowQRForm.controls['accountId'].setValue(
      this.selectedAccount?.accountId
    );

    this.escrowQRForm.controls['fixedAmount'].setValue(
      this.fixedAmount === 'yes' ? true : false
    );

    if (!this.isAdmin) {
      this.escrowQRForm.removeControl('merchantId');
    }

    this.escrowQRService.createEscrowQR(this.escrowQRForm.value).subscribe(
      (resp: any) => {
        if (resp.success) {
          this.escrowQRList.unshift(resp.result as any);
          if (resp.result && this.escrowQRList.length >= 10) {
            this.escrowQRList.pop();
          }
          this.selectedMerchant = null;
          this.selectedAccount = null;
          this.escrowQRForm.reset();
          this.onCancel();
          this.spinner.hide();
          this.cdr.detectChanges();
        }
      },
      error => {
        this.errors = error;
        this.spinner.hide();
        this.cdr.detectChanges();
      },
      () => {
        // 'onCompleted' callback.
        // No errors, route to new page here
      }
    );
  }

  showDetails(refId: string) {
    if (!this.isAdmin) {
      this.router.navigate([
        environment.urlPortalPrefix + '/escrowqr/' + refId
      ]);
    } else {
      this.router.navigate(
        [environment.urlAdminPrefix + '/allescrowqr/' + refId],
        {
          // queryParams: { merchantId: this.merchantId }
        }
      );
    }
  }

  goBack() {
    this._location.back();
  }
}

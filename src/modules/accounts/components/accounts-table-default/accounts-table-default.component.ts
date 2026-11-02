import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from '@common/services';
import { CreateAccountComponent } from '@modules/accounts/components/create-account/create-account.component';
import { Account } from '@modules/accounts/models/accounts.model';
import { AccountsService } from '@modules/accounts/services/accounts.service';
import { AuthService } from '@modules/auth/services';
import { ProfileService } from '@modules/profile/services';
import { SortEvent } from '@modules/tables/directives';
import { SBSortableHeaderDirective } from '@modules/transactions/directives';
import {
  NgbDateStruct,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import * as htmlToImage from 'html-to-image';

@Component({
  selector: 'sbpro-accounts-table-default',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accounts-table-default.component.pug',
  styleUrls: ['accounts-table-default.component.scss']
})
export class AccountsTableDefaultComponent implements OnInit, OnDestroy {
  @Input() pageSize = 8;
  @Input() hardEscrowNumber = '';
  @Input() merchantId = '';
  model!: NgbDateStruct;
  modalRef?: NgbModalRef;
  detailsModal?: NgbModalRef;
  @ViewChild('detailsTemplate')
  private detailsTemplate!: TemplateRef<any>;
  account$!: Observable<Account[]>;
  total$!: Observable<number>;
  sortedColumn!: string;
  sortedDirection!: string;
  isSelected = false;
  selectedAccount = {} as Account;
  apiDomain = environment.apiHost + '/uploads/docs/';
  clearForm = false;
  qrCode = '';
  upiId = '';
  profile = {};
  upiEnabled = false;
  @ViewChildren(SBSortableHeaderDirective) headers!: QueryList<
    SBSortableHeaderDirective
  >;
  phonepe = '../../../../assets/img/PhonePe-Logo.wine.png';
  paytm = '../../../../assets/img/Paytm-Logo.wine.png';
  gpay = '../../../../assets/img/gpay.png';
  rbl = '../../../../assets/img/rbl.png';
  merchantName: string | null = '';

  @ViewChild('screen') screen: any;
  @Output() emitMerchantId: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    public accountsService: AccountsService,
    public changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private router: Router,
    private utilityService: UtilityService,
    private spinner: NgxSpinnerService,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  checkboxAction(checkbox: HTMLInputElement) {
    if (checkbox.checked) {
      this.accountsService.isAuto = true;
      this.accountsService.performSearch();
    } else {
      this.accountsService.isAuto = false;
      this.accountsService.performSearch();
    }
  }

  ngOnInit() {
    this.profileService.getProfile(null, false).subscribe((resp: any) => {
      this.upiEnabled = resp.result.upiEnabled || false;
    });
    this.accountsService.isAuto = false;
    this.accountsService.searchTerm = '';  // Reset search term on component load
    this.accountsService.performSearch();
    this.accountsService.pageSize = this.pageSize;
    this.accountsService.hardEscrowAccountNumber = this.hardEscrowNumber;
    this.accountsService.merchantId = this.merchantId;
    this.account$ = this.accountsService.account$;
    this.total$ = this.accountsService.total$;
    this.merchantName = this.authService.getTitle();
  }

  submitSearchForm() {
    this.clearForm = true;
    console.log('Submitting Search Form');

    // Reload the data
    this.accountsService.performSearch();
  }

  clearSearchForm() {
    this.clearForm = false;
    this.accountsService.searchTerm = '';
    this.accountsService.performSearch();
  }

  checkActiveInactive(value: string): string {
    let time = new Date(value);
    let currentTime = new Date();
    if (
      currentTime.getTime() >= time.getTime() ||
      time.getDate() === currentTime.getDate()
    ) {
      return 'Active';
    } else {
      return 'InActive';
    }
  }

  toggle() {
    this.isSelected = !this.isSelected;
  }

  fetchDetails(account: Account) {
    this.emitMerchantId.emit(account.merchantId);
    this.router.navigate([
      `${environment.urlPortalPrefix}/escrow/${account.accountId}`,
      {}
    ]);
  }

  ngOnDestroy() {
    this.accountsService.performReset();
  }

  onSort({ column, direction }: SortEvent) {
    // this.sortedColumn = column;
    // this.sortedDirection = direction;
    // this.activitiesService.sortColumn = column;
    // this.activitiesService.sortDirection = direction;
    // this.changeDetectorRef.detectChanges();
  }

  /**
   * Format number according to Indian currency
   * @param number
   * @returns
   */
  public toINR(number: number) {
    return this.utilityService.toINR(number);
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

  showQRCode(accountId: string, vpa: string) {
    this.spinner.show();
    this.getQRCode(accountId);
    this.upiId = vpa;
    this.openQRModal(this.detailsTemplate);
    this.changeDetectorRef.detectChanges();
    this.spinner.hide();
  }

  onCancel() {
    /**
     * Remove Old errors
     * to prevent the error's dismissable
     * issue
     */
    this.detailsModal?.close();
    this.changeDetectorRef.detectChanges();
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
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef
} from '@angular/core';
import { Router } from '@angular/router';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { SummaryBillComponent } from '@modules/invoices/components';
import { SelectedMerchants } from '@modules/invoices/models/invoices.model';
import { Bill, BillResponseModel } from '@modules/merchant/models';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { BillingService } from '@modules/merchant/services';
import { ProfileService } from '@modules/profile/services';
import {
  NgbCalendar,
  NgbDate,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Merchant,
  MerchantResponseModel
} from '@modules/auth/models/merchant.model';

@Component({
  selector: 'sbpro-merchant-billing-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './merchant-billing-detail.component.pug',
  styleUrls: ['merchant-billing-detail.component.scss']
})
export class MerchantBillingDetailComponent implements OnInit {
  /**
   *    DROPDOWN SETTINGS
   */
  loading = false;
  disabled = false;
  ShowFilter = true;
  limitSelection = false;
  selectedItems: SelectedMerchants[] = [];
  dropdownSettings: IDropdownSettings = {};
  merchants: Merchant[] = [];

  @Input() merchantId = '';
  year = new Date().getFullYear();
  billing$!: Observable<Bill[]>;
  total$!: Observable<number>;
  private _loadingList$ = new BehaviorSubject(false);
  feeType = ['virtualAccount', 'monthly', 'transaction', 'setUpFee', 'pennyTest'];
  modalRef?: NgbModalRef;

  selectedMonth = '';
  merchantProfile?: MerchantProfile;
  errors: string[] = [];

  get months() {
    let months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    return months.splice(0, new Date().getMonth());
  }

  constructor(
    private billingService: BillingService,
    public changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private calendar: NgbCalendar,
    private modalService: NgbModal,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {
    this.billingService.getMerchants().subscribe(
      (resp: MerchantResponseModel) => {
        this.merchants = resp.result;
        console.log(this.merchants);
      },
      err => {
        console.log(err);
        this.errors = ['could not load recipients. please try again later.'];
        this.cdr.detectChanges();
      }
    );
  }

  get loadingList$(): Observable<boolean> {
    return this._loadingList$.asObservable();
  }
  
  handleLimitSelection() {
    if (this.limitSelection) {
      this.dropdownSettings = Object.assign({}, this.dropdownSettings, {
        limitSelection: 2
      });
    } else {
      this.dropdownSettings = Object.assign({}, this.dropdownSettings, {
        limitSelection: null
      });
    }
  }

  ngOnInit() {
    this.selectedItems = [];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'merchantId',
      textField: 'title',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 2,
      allowSearchFilter: this.ShowFilter
    };
    if (this.merchantId) {
      this.billingService.merchants = [this.merchantId];
    }
    this.billing$ = this.billingService.bills$;
    this.total$ = this.billingService.total$;
    this.loadData();

    // this.profileService.getProfile(this.merchantId, false).subscribe(resp => {
    //   console.log(resp);
    //   if (resp.success) {
    //     this.merchantProfile = resp.result;
    //     this.changeDetectorRef.detectChanges();
    //   }
    // });
  }

  async loadData() {
    this._loadingList$.next(true);
    this.billingService._search().subscribe((resp: BillResponseModel) => {
      this._loadingList$.next(false);
    });
  }

  async submitSearchForm() {
    this.billingService.merchants = await this.selectedItems.map(
      x => x.merchantId
    );

    this.billingService.page = 1;
  }

  clearForm() {
    console.log('clearing form');
    this.billingService.dateFrom = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.billingService.dateTo = this.calendar.getNext(
      new NgbDate(0, 0, 0),
      'd',
      0
    );
    this.billingService.page = 1;
    this.billingService.feeType = '';
    this.selectedItems = [];
    this.billingService.merchants = [];
    this.loadData();
  }

  monthlyInvoiceModal(modal: HTMLTemplateElement) {
    this.modalRef = this.modalService.open(modal, {
      size: 'lg',
      backdrop: 'static'
    });
  }

  close() {
    this.modalRef?.close();
  }

  generateInvoice() {
    this.modalRef = this.modalService.open(SummaryBillComponent, {
      size: 'xl'
    });
    this.modalRef.componentInstance.merchantId = this.merchantId;
    this.modalRef.componentInstance.month = this.months.indexOf(
      this.selectedMonth
    );
    this.modalRef.componentInstance.year = this.year;
    this.modalRef.componentInstance.viewMode = true;
    this.modalRef.componentInstance.modalRef = this.modalRef;
  }

  openAccountDetail(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/account/' + id]);
  }

  openTransferDetails(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/transfer/' + id]);
  }

  openKYCDetails(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/alluserskyc/' + id]);
  }
}

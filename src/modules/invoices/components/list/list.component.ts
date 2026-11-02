import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import {
  Merchant,
  MerchantResponseModel
} from '@modules/auth/models/merchant.model';
import { SummaryBillComponent } from '@modules/invoices/components/summary-bill/summary-bill.component';
import {
  Invoice,
  InvoiceRespModel,
  SelectedMerchants
} from '@modules/invoices/models';
import { InvoicesService } from '@modules/invoices/services';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'sbpro-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list.component.pug',
  styleUrls: ['list.component.scss']
})
export class ListComponent implements OnInit {
  /**
   * modal settings
   */
  modalRef?: NgbModalRef;

  /**
   *    DROPDOWN SETTINGS
   */
  loading = false;
  disabled = false;
  ShowFilter = true;
  limitSelection = false;
  selectedItems: SelectedMerchants[] = [];
  dropdownSettings: IDropdownSettings = {};
  @Input() merchantId = '';

  /**
   *    TOGGLERS AND DATA VARIABLES
   */
  merchants: Merchant[] = [];
  errors: string[] = [];

  invoices$: Invoice[] = [];

  months = [
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

  years = ['2021', '2022'];

  constructor(
    private invoiceService: InvoicesService,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private modalService: NgbModal
  ) {
    this.invoiceService.getMerchants().subscribe(
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

  ngOnInit() {
    this.selectedItems = this.merchantId
      ? [{ merchantId: this.merchantId, email: '' }]
      : [];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'merchantId',
      textField: 'title',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 2,
      allowSearchFilter: this.ShowFilter
    };

    this.submitSearchForm();
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

  submitSearchForm() {
    this.invoiceService.merchants = this.selectedItems.map(x => x.merchantId);
    this.invoiceService.retrieveData().subscribe((resp: InvoiceRespModel) => {
      console.log(resp);
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  clearForm() {
    (this.invoiceService.searchTerm = ''),
      (this.invoiceService.month = 0),
      (this.invoiceService.year = 0),
      (this.invoiceService.merchants = []);
    this.submitSearchForm();
  }

  viewModal(invoice: Invoice) {
    this.modalRef = this.modalService.open(SummaryBillComponent, {
      size: 'xl'
    });
    this.modalRef.componentInstance.invoiceId = invoice.invoiceId;
    this.modalRef.componentInstance.merchantId = invoice.merchantId;
    this.modalRef.componentInstance.month = invoice.month - 1;
    this.modalRef.componentInstance.year = invoice.year;
    this.modalRef.componentInstance.viewMode = true;
    this.modalRef.componentInstance.modalRef = this.modalRef;
  }

  summaryPage(id: string, merchantId: string, month: number, year: number) {
    month = month - 1;
    year = year;
    this.route.navigate(
      [`${environment.urlAdminPrefix}/invoices/${id}/summary`],
      { queryParams: { merchantId, month, year } }
    );
  }
}

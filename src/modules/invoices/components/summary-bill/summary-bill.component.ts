import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Bill, BillResponseModel } from '@modules/merchant/models';
import { InvoicesService } from '@modules/invoices/services';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { ProfileService } from '@modules/profile/services';
import { feeType } from '@modules/invoices/models/invoices.model';

@Component({
  selector: 'sbpro-summary-bill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './summary-bill.component.pug',
  styleUrls: ['summary-bill.component.scss']
})
export class SummaryBillComponent implements OnInit {
  @Input() merchantId: string = '';
  @Input() invoiceId: string = '';
  @Input() month: number = 0;
  @Input() viewMode = false;
  @Input() modalRef?: NgbModalRef;
  @Input() year = 0;
  startDate = '';
  lastDate = '';
  total = 0;
  merchantProfile?: MerchantProfile;

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
  billing: Bill[] = [];
  groupedBill = {};
  feeTypes = feeType;

  constructor(
    private _location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private invoiceService: InvoicesService,
    private cdr: ChangeDetectorRef,
    private profileService: ProfileService
  ) {
    this.invoiceId = this.route.snapshot.paramMap.get('invoiceId') || '';
    this.merchantId = this.route.snapshot.queryParamMap.get('merchantId') || '';
    this.month = parseInt(
      this.route.snapshot.queryParamMap.get('month') || '1'
    );
    this.year = parseInt(
      this.route.snapshot.queryParamMap.get('year') || '1'
    );
  }
  ngOnInit() {
    this.profileService.getProfile(this.merchantId, false).subscribe(resp => {
      console.log(resp);
      if (resp.success) {
        this.merchantProfile = resp.result;
        this.cdr.detectChanges();
      }
    });
    this.startDate = new Date(this.year, this.month, 1).toISOString();
    this.lastDate = new Date(this.year, this.month + 1, 0).toISOString();
    this.invoiceService
      .getBills(this.merchantId, this.startDate, this.lastDate)
      .subscribe((resp: BillResponseModel) => {
        console.log(resp);
        if (resp.success) {
          this.billing = resp.result;
          this.groupedBill = this.groupBy(this.billing, 'billingType');
          this.total = this.getSum(this.billing);
          this.cdr.detectChanges();
        }
      });
  }

  groupBy(objectArray: Bill[], property: keyof Bill) {
    return objectArray.reduce(function(acc, obj) {
      let key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {} as Record<string | number, Bill[]>);
  }

  getSum(arr: Bill[]) {
    let total = arr.reduce(function(prev: number, curr: Bill) {
      return prev + curr.billingAmount;
    }, 0);
    return total;
  }

  goBack() {
    this._location.back();
  }

  detailed() {
    this.router.navigate(
      [`${environment.urlAdminPrefix}/invoices/${this.invoiceId}/detailed`],
      { queryParams: { merchantId: this.merchantId, month: this.month, year: this.year } }
    );
  }

  closeModal() {
    this.modalRef?.close();
  }
}

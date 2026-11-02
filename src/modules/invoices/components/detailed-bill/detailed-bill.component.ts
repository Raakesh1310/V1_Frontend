import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Bill, BillResponseModel } from '@modules/merchant/models';
import { InvoicesService } from '@modules/invoices/services';
import { MerchantProfile } from '@modules/auth/models/merchantProfile.model';
import { ProfileService } from '@modules/profile/services';
import { feeType } from '@modules/invoices/models/invoices.model';

@Component({
  selector: 'sbpro-detailed-bill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detailed-bill.component.pug',
  styleUrls: ['detailed-bill.component.scss']
})
export class DetailedBillComponent implements OnInit {
  @Input() merchantId: string = '';
  invoiceId: string = '';
  @Input() month: number = 0;
  startDate = '';
  lastDate = '';
  @Input() year = 0;
  total = 0;
  @Input() viewMode = false;
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

  // billing settings
  billing: Bill[] = [];
  feeTypes = feeType;

  constructor(
    private _location: Location,
    private activatedRoute: ActivatedRoute,
    private invoiceService: InvoicesService,
    private cdr: ChangeDetectorRef,
    private profileService: ProfileService
  ) {
    console.log(this.activatedRoute.snapshot.queryParamMap.keys);
    this.invoiceId =
      this.activatedRoute.snapshot.paramMap.get('invoiceId') || '';
    this.merchantId =
      this.activatedRoute.snapshot.queryParamMap.get('merchantId') || '';
    this.month = parseInt(
      this.activatedRoute.snapshot.queryParamMap.get('month') || '1'
    );
    this.year = parseInt(
      this.activatedRoute.snapshot.queryParamMap.get('year') || '1'
    );
  }

  ngOnInit() {
    console.log(this.invoiceId);
    console.log(this.merchantId);
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
          this.total = this.billing.reduce(function(prev, curr) {
            return prev + curr.billingAmount;
          }, 0);
          this.cdr.detectChanges();
        }
      });
  }

  goBack() {
    this._location.back();
  }
}

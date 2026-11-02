import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { UtilityService } from '@common/services';
import { RazorpayOrderResponseModel } from '@modules/accounts/models/razorpay-response.model';
import { AccountsService } from '@modules/accounts/services';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'sbpro-accounts-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accounts-payment.component.pug',
  styleUrls: ['accounts-payment.component.scss']
})
export class AccountsPaymentComponent implements OnInit {
  errors: string[] = [];
  @Input() merchantDetails = {
    id: '',
    merchantName: '',
    merchantEmail: '',
    merchantPhone: ''
  };
  @Input() paymentAmount = 0;
  totalAmount = 0;
  gst = 0.18;
  currency = 'INR';
  toastHead = '';
  toastBody = '';
  addedGst = 0;

  private _loading$ = new BehaviorSubject(false);
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }
  constructor(
    private utilityService: UtilityService,
    private cdr: ChangeDetectorRef,
    private accountsService: AccountsService
  ) {}

  ngOnInit() {
    this.addedGst = Math.round(this.paymentAmount * this.gst * 1e2) / 1e2;
    this.totalAmount = this.paymentAmount + this.addedGst;
  }

  getRzpOrder = async (): Promise<RazorpayOrderResponseModel> => {
    this._loading$.next(true);
    return new Promise((resolve, reject) => {
      this.accountsService
        .createRzpOrder(
          this.totalAmount * 100,
          this.currency,
          this.merchantDetails.id
        )
        .subscribe(
          resp => {
            if (resp.id) {
              const response = {
                id: resp.id,
                receipt: resp.receipt
              };
              resolve(response);
            }
            reject('Order Id could not be created');
          },
          err => {
            reject(err);
          }
        );
    });
  };

  payAmount = async () => {
    try {
      let paymentOrder = await this.getRzpOrder();
      let options = {
        key: environment.razorpayKey,
        amount: (this.paymentAmount * 100).toString(),
        currency: this.currency,
        name: 'Castler',
        description: 'Account Opening',
        image: environment.razorpayLogo,
        order_id: paymentOrder.id,
        callback_url:
          environment.apiPrefix +
          '/razorpay/' +
          paymentOrder.receipt +
          '/verification',
        prefill: {
          name: this.merchantDetails.merchantName,
          email: this.merchantDetails.merchantEmail,
          contact: this.merchantDetails.merchantPhone
        },
        notes: {
          urlPath: environment.apiPrefix + '/razorpay/verify'
        },
        theme: {
          color: '#3399cc'
        }
      };
      let rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      this.toastBody = error.toString();
      this.toastHead = 'Error';
      this.utilityService.showToast(this.toastHead, this.toastBody, {
        headerClasses: 'bg-danger text-white'
      });
      this.cdr.detectChanges();
    }
  };
}

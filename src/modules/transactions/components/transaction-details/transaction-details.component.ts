import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Transaction } from '@modules/transactions/models';
import { TransactionService } from '@modules/transactions/services';
import { BehaviorSubject, Observable } from 'rxjs';
import * as date from 'date-and-time';

@Component({
  selector: 'sbpro-transaction-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-details.component.pug',
  styleUrls: ['transaction-details.component.scss']
})
export class TransactionDetailsComponent implements OnInit {
  @Input() transactionId!: string;
  transaction!: Transaction;

  private _loadingData$ = new BehaviorSubject(false);

  get loadingData$(): Observable<boolean> {
    return this._loadingData$.asObservable();
  }

  goBack() {
    window.history.back();
  }

  constructor(private transactionService: TransactionService) { }

  ngOnInit() {
    /**
     * Initiate the call to load the data
     * for given transaction Id
     * through service
     */
    this._loadingData$.next(true);
    this.transactionService.isSuperAdmin = false;
    this.transactionService
      .findOne({ transactionId: this.transactionId })
      ?.subscribe(
        resp => {
          console.log(resp);
          /**
           * Got a response from
           * server, handle it
           */
          this.transaction = resp.result;
          this._loadingData$.next(false);
          // this.getBankNameFromIFSC(this.transaction.remitterIFSCCode);
        },
        err => {
          this._loadingData$.next(false);
          /**
           * Handle errors
           * got from the server
           */
        }
    );
  }

  // Get Bank Names for the transaction
  // getBankNameFromIFSC(ifsc: string) {
  //   if (this.transaction !== null && this.transaction !== undefined) {
  //     this.transactionService.getIFSCData(ifsc).subscribe(
  //       resp => {
  //         this.transaction.remitterBankName = resp.BANK as string
  //         this._loadingData$.next(false);
  //       },
  //       err => {
  //         console.log(err);
  //         this._loadingData$.next(false);
  //       }
  //     );
  //   }
  // }

  getParsedDate(inputDate: Date) {
    if (!inputDate) {
      return '';
    }
    const d = new Date(inputDate);
    // const d = new Date(inputDate);
    return `${date.format(d, 'DD MMM YYYY')}, ${d.toLocaleTimeString()}`;
  }

}

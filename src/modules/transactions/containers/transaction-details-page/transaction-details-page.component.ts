import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'sbpro-transaction-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-details-page.component.pug',
  styleUrls: ['transaction-details-page.component.scss']
})
export class TransactionDetailsPageComponent implements OnInit {
  public transactionId!: string | null;

  constructor(private router: Router, private route: ActivatedRoute) {
    try {
      this.transactionId = this.route.snapshot.paramMap.get('id');
    } catch (e) {
      console.log(e);
    }
  }

  ngOnInit() {}
}

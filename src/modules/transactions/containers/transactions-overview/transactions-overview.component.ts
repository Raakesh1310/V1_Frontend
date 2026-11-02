import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-transactions-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transactions-overview.component.pug',
  styleUrls: ['transactions-overview.component.scss']
})
export class TransactionsOverviewComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

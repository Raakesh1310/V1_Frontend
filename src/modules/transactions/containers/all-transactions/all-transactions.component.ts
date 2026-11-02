import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-all-transactions-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './all-transactions.component.pug',
  styleUrls: ['all-transactions.component.scss']
})
export class AllTransactionsComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

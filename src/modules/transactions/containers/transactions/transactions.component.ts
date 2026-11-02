import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-transactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transactions.component.pug',
  styleUrls: ['transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

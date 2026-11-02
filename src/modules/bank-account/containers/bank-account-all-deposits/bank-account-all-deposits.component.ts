import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-all-deposits',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bank-account-all-deposits.component.pug',
  styleUrls: ['./bank-account-all-deposits.component.scss']
})
export class AllDepositsComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }

}

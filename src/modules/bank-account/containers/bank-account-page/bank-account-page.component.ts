import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-bank-account-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bank-account-page.component.pug',
  styleUrls: ['./bank-account-page.component.scss']
})
export class BankAccountPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-account-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-page.component.pug',
  styleUrls: ['account-page.component.scss']
})
export class AccountPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

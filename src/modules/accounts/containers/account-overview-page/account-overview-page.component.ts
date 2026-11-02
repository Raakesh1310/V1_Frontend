import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-account-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-overview-page.component.pug',
  styleUrls: ['account-overview-page.component.scss']
})
export class AccountOverviewPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

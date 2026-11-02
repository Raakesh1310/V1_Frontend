import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-merchant-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './merchant-list-page.component.pug',
  styleUrls: ['merchant-list-page.component.scss']
})
export class MerchantListPageComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

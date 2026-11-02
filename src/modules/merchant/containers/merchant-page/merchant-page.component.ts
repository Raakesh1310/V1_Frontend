import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-merchant-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './merchant-page.component.pug',
  styleUrls: ['merchant-page.component.scss']
})
export class MerchantPageComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

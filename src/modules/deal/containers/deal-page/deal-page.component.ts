import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-deal-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deal-page.component.pug',
  styleUrls: ['deal-page.component.scss']
})
export class DealPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

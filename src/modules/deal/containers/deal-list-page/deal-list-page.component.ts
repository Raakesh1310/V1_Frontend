import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-deal-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deal-list-page.component.pug',
  styleUrls: ['deal-list-page.component.scss']
})
export class DealListPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

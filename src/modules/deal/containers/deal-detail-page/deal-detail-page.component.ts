import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-deal-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deal-detail-page.component.pug',
  styleUrls: ['deal-detail-page.component.scss']
})
export class DealDetailPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

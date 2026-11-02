import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-dashboard-multi-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-multi-card.component.pug',
  styleUrls: ['dashboard-multi-card.component.scss']
})
export class DashboardMultiCardComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

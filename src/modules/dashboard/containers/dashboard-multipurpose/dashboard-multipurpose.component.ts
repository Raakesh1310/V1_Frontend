import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-dashboard-multipurpose',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-multipurpose.component.pug',
  styleUrls: ['dashboard-multipurpose.component.scss']
})
export class DashboardMultipurposeComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

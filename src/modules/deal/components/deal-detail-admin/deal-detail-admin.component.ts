import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-deal-detail-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deal-detail-admin.component.pug',
  styleUrls: ['deal-detail-admin.component.scss']
})
export class DealDetailAdminComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

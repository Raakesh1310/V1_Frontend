import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-manage-team-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manage-team-overview.component.pug',
  styleUrls: ['manage-team-overview.component.scss']
})
export class ManageTeamOverviewComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

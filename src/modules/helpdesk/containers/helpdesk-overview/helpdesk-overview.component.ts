import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-helpdesk-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './helpdesk-overview.component.pug',
  styleUrls: ['helpdesk-overview.component.scss']
})
export class HelpdeskOverviewComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

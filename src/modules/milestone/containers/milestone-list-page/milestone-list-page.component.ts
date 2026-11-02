import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-milestone-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './milestone-list-page.component.pug',
  styleUrls: ['milestone-list-page.component.scss']
})
export class MilestoneListPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

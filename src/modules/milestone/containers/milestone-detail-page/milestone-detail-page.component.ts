import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-milestone-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './milestone-detail-page.component.pug',
  styleUrls: ['milestone-detail-page.component.scss']
})
export class MilestoneDetailPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

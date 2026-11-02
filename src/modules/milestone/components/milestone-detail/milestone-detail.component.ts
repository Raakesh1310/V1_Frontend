import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-milestone-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './milestone-detail.component.pug',
  styleUrls: ['milestone-detail.component.scss']
})
export class MilestoneDetailComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

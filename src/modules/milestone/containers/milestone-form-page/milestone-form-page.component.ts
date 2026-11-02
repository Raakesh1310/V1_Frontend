import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-milestone-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './milestone-form-page.component.pug',
  styleUrls: ['milestone-form-page.component.scss']
})
export class MilestoneFormPageComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

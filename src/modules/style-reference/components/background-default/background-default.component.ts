import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-background-default',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './background-default.component.pug',
  styleUrls: ['background-default.component.scss']
})
export class BackgroundDefaultComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

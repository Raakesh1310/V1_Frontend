import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-background-expanded',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './background-expanded.component.pug',
  styleUrls: ['background-expanded.component.scss']
})
export class BackgroundExpandedComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

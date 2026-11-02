import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sb-layout-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './layout-error.component.pug',
  styleUrls: ['layout-error.component.scss']
})
export class LayoutErrorComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

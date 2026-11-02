import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sb-static',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './static.component.pug',
  styleUrls: ['static.component.scss']
})
export class StaticComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-borders-radius',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './borders-radius.component.pug',
  styleUrls: ['borders-radius.component.scss']
})
export class BordersRadiusComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

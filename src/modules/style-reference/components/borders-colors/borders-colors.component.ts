import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-borders-colors',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './borders-colors.component.pug',
  styleUrls: ['borders-colors.component.scss']
})
export class BordersColorsComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

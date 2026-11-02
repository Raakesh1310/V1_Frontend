import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TOCIndexItem } from '@modules/toc/models';

@Component({
  selector: 'sbpro-shadows',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shadows.component.pug',
  styleUrls: ['shadows.component.scss']
})
export class ShadowsComponent implements OnInit {
  tocIndex: TOCIndexItem[] = [{ title: 'Default' }, { title: 'Extended' }];
  constructor() {}
  ngOnInit() {}
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TOCIndexItem } from '@modules/toc/models';

@Component({
  selector: 'sbpro-animations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './animations.component.pug',
  styleUrls: ['animations.component.scss']
})
export class AnimationsComponent implements OnInit {
  tocIndex: TOCIndexItem[] = [{ title: 'Fade In' }, { title: 'Fade In Up' }];
  constructor() {}
  ngOnInit() {}
}

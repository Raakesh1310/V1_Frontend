import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { CardBase } from '@common/classes';

@Component({
  selector: 'sbpro-card-view-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-view-details.component.pug',
  styleUrls: ['card-view-details.component.scss']
})
export class CardViewDetailsComponent extends CardBase implements OnInit {
  @Input() background!: string;
  @Input() color!: string;
  @Input() link = '';

  constructor() {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
  }
}

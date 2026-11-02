import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { CardBase } from '@common/classes';

@Component({
  selector: 'sbpro-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.component.pug',
  styleUrls: ['card.component.scss']
})
export class CardComponent extends CardBase implements OnInit, OnChanges {
  @Input() headerActions!: boolean;
  @Input() scrollable = false;

  @Input() showSkeletonLoader!: boolean;

  constructor() {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.headerActions) {
      this.cardClasses.push('card-header-actions');
    }
    if (this.scrollable) {
      this.cardClasses.push('card-scrollable');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('following changes found: ');
    // console.log(changes);
  }
}

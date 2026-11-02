import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { CardBase } from '@common/classes';

@Component({
  selector: 'sbpro-dashboard-card-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-card-details.component.pug',
  styleUrls: ['dashboard-card-details.component.scss']
})
export class DashboardCardDetailsComponent extends CardBase implements OnInit {
  @Input() background!: string;
  @Input() color!: string;
  @Input() link = '';
  @Input() linkText = '';
  @Input() description = '';

  constructor() {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    // console.log(this.linkText);
  }
}

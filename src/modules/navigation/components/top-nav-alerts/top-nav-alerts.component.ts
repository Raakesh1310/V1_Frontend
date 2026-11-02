import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { AlertsService } from '@modules/alerts/services';

@Component({
  selector: 'sbpro-top-nav-alerts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-nav-alerts.component.pug',
  styleUrls: ['top-nav-alerts.component.scss']
})
export class TopNavAlertsComponent implements OnInit {
  @Input() placement = 'bottom-right';
  dropdownClasses: string[] = [];
  constructor(public alertsService: AlertsService) {}
  ngOnInit() {}
}

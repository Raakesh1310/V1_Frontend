import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-notifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications.component.pug',
  styleUrls: ['notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-activity-logs',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './activity-logs.component.pug',
    styleUrls: ['activity-logs.component.scss'],
})
export class ActivityLogsComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

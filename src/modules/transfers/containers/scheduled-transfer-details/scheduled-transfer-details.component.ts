import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-scheduled-transfer-details',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './scheduled-transfer-details.component.pug',
    styleUrls: ['scheduled-transfer-details.component.scss'],
})
export class ScheduledTransferDetailsComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-scheduled-transfer-sa-details',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './scheduled-transfer-sa-details.component.pug',
    styleUrls: ['scheduled-transfer-sa-details.component.scss'],
})
export class ScheduledTransferSaDetailsComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

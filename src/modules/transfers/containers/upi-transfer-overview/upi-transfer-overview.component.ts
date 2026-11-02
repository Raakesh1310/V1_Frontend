import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-upi-transfer-overview',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './upi-transfer-overview.component.pug',
    styleUrls: ['upi-transfer-overview.component.scss'],
})
export class UpiTransferOverviewComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

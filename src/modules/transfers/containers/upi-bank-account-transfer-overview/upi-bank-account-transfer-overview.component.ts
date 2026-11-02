import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-upi-bank-account-transfer-overview',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './upi-bank-account-transfer-overview.component.pug',
    styleUrls: ['upi-bank-account-transfer-overview.component.scss'],
})
export class UpiBankAccountTransferOverviewComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

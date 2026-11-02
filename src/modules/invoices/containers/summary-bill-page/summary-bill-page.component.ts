import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-summary-bill-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './summary-bill-page.component.pug',
    styleUrls: ['summary-bill-page.component.scss'],
})
export class SummaryBillPageComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

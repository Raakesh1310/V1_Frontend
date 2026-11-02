import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-detailed-bill-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './detailed-bill-page.component.pug',
    styleUrls: ['detailed-bill-page.component.scss'],
})
export class DetailedBillPageComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

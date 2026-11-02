import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-invoices',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './invoices.component.pug',
    styleUrls: ['invoices.component.scss'],
})
export class InvoicesComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

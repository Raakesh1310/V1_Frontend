import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-statement',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './statement.component.pug',
    styleUrls: ['statement.component.scss'],
})
export class StatementComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

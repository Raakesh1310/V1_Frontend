import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-report-overview',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './report-overview.component.pug',
    styleUrls: ['report-overview.component.scss'],
})
export class ReportOverviewComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

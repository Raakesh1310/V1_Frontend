import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-report-list-overview',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './report-list-overview.component.pug',
    styleUrls: ['report-list-overview.component.scss'],
})
export class ReportListOverviewComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

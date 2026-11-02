import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-all-vpas',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './all-vpas.component.pug',
    styleUrls: ['all-vpas.component.scss'],
})
export class AllVpasComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-parties',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './parties.component.pug',
    styleUrls: ['parties.component.scss'],
})
export class PartiesComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

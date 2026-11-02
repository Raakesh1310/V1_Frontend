import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-mail-list-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './mail-list-page.component.pug',
    styleUrls: ['mail-list-page.component.scss'],
})
export class MailListPageComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-mail-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './mail-page.component.pug',
    styleUrls: ['mail-page.component.scss'],
})
export class MailPageComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

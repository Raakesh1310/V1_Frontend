import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-mail-form-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './mail-form-page.component.pug',
    styleUrls: ['mail-form-page.component.scss'],
})
export class MailFormPageComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

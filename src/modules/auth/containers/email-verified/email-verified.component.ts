import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-email-verified',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './email-verified.component.pug',
    styleUrls: ['email-verified.component.scss'],
})
export class EmailVerifiedComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

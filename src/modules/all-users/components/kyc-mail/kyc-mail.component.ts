import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-kyc-mail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './kyc-mail.component.pug',
    styleUrls: ['kyc-mail.component.scss'],
})
export class KycMailComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

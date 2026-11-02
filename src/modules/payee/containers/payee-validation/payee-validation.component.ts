import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-payee-validation-container',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './payee-validation.component.pug',
    styleUrls: ['payee-validation.component.scss'],
})
export class PayeeValidationContainer implements OnInit {
    constructor() { }
    ngOnInit() { }
}

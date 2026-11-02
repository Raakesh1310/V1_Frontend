import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-create-password',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './create-password.component.pug',
    styleUrls: ['create-password.component.scss'],
})
export class CreatePasswordComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

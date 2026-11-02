import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sbpro-kyc-outline',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './kyc-outline.component.pug',
    styleUrls: ['kyc-outline.component.scss'],
})
export class KycOutlineComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}

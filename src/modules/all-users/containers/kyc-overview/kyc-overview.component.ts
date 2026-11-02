import { 
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild 
} from '@angular/core';

import { KycComponent } from '@modules/all-users/components';

@Component({
    selector: 'sbpro-kyc-overview',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './kyc-overview.component.pug',
    styleUrls: ['kyc-overview.component.scss'],
})
export class KycOverviewComponent implements OnInit {
    @ViewChild(KycComponent) child?: KycComponent;
    constructor() {}
    ngOnInit() {}
}

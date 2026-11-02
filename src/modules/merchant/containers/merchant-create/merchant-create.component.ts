import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

@Component({
  selector: 'sbpro-merchant-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './merchant-create.component.pug',
  styleUrls: ['merchant-create.component.scss']
})
export class MerchantCreateComponent implements OnInit {
  disabledTabs = [
    'Business profile',
    'Documents',
    'Bank details',
    'Escrow Parties',
    'Fees',
    'Authorizer',
    'Settings'
  ];
  //disabledTabs = [];
  merchantId = '';
  tabIndex = 0;
  merchantEmail = '';

  constructor(private cdr: ChangeDetectorRef) {}
  ngOnInit() {}

  setMerchantIdAndEmail(merchantDetails: {
    merchantId: string;
    merchantEmail: string;
  }) {
    this.merchantId = merchantDetails.merchantId;
    this.merchantEmail = merchantDetails.merchantEmail;
    this.enableNextTabs();
  }

  enableNextTabs() {
    if (this.disabledTabs.length > 0) {
      this.disabledTabs = [];
      this.tabIndex = 1;
    }
    this.cdr.detectChanges();
  }
}

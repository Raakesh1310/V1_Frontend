import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-escrow-customer-detail-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escrow-customer-detail-admin-page.component.pug',
  styleUrls: ['escrow-customer-detail-admin-page.component.scss']
})
export class EscrowCustomerDetailAdminPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

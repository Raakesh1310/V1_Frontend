import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-escrow-list-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escrow-list-admin-page.component.pug',
  styleUrls: ['escrow-list-admin-page.component.scss']
})
export class EscrowListAdminPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

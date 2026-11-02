import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-transfer-authorization-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transfer-authorization-page.component.pug',
  styleUrls: ['transfer-authorization-page.component.scss']
})
export class TransferAuthorizationPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

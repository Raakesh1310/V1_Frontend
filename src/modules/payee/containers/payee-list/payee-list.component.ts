import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-payee-list-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payee-list.component.pug',
  styleUrls: ['payee-list.component.scss']
})
export class PayeeListComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

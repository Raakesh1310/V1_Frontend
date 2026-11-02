import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-payee-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payee-detail.component.pug',
  styleUrls: ['payee-detail.component.scss']
})
export class PayeeDetailComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

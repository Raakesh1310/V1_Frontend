import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-payee-basic-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payee-basic-detail.component.pug',
  styleUrls: ['payee-basic-detail.component.scss']
})
export class PayeeBasicDetailComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

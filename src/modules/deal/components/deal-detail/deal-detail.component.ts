import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-deal-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deal-detail.component.pug',
  styleUrls: ['deal-detail.component.scss']
})
export class DealDetailComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-all-deals-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './all-deals-page.component.pug',
  styleUrls: ['all-deals-page.component.scss']
})
export class AllDealsPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

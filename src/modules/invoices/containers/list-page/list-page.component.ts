import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list-page.component.pug',
  styleUrls: ['list-page.component.scss']
})
export class ListPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-navigation-sticky',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navigation-sticky.component.pug',
  styleUrls: ['navigation-sticky.component.scss']
})
export class NavigationStickyComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

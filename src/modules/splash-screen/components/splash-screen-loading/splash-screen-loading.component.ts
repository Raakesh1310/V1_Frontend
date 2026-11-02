import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-splash-screen-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './splash-screen-loading.component.pug',
  styleUrls: ['splash-screen-loading.component.scss']
})
export class SplashScreenLoadingComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

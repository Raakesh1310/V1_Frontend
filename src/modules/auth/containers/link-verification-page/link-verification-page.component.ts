import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-link-verification-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './link-verification-page.component.pug',
  styleUrls: ['link-verification-page.component.scss']
})
export class LinkVerificationPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

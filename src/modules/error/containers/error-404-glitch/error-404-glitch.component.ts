import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-error-404-glitch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-404-glitch.component.pug',
  styleUrls: ['error-404-glitch.component.scss']
})
export class Error404GlitchComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

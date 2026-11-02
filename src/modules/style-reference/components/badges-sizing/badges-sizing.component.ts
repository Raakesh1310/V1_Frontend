import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CodeSample } from '@modules/style-reference/models';

@Component({
  selector: 'sbpro-badges-sizing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badges-sizing.component.pug',
  styleUrls: ['badges-sizing.component.scss']
})
export class BadgesSizingComponent implements OnInit {
  codeSamples: CodeSample[] = [
    {
      language: 'pug',
      code: pugCode
    }
  ];
  constructor() {}
  ngOnInit() {}
}

const pugCode = `
h1 Example Heading
    span.badge.badge-primary.ml-2 New

p This is an example paragraph with a badge at the end!
    span.badge.badge-primary.ml-2 New

button.btn.btn-primary.mr-2 Messages
    span.badge.badge-white.ml-2 5
`.trim();

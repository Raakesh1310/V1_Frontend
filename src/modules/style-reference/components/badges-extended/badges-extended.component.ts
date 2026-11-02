import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CodeSample } from '@modules/style-reference/models';

@Component({
  selector: 'sbpro-badges-extended',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badges-extended.component.pug',
  styleUrls: ['badges-extended.component.scss']
})
export class BadgesExtendedComponent implements OnInit {
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
span.badge.badge-red.mr-2 Red
`.trim();

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CodeSample } from '@modules/style-reference/models';

@Component({
  selector: 'sbpro-alerts-default',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alerts-default.component.pug',
  styleUrls: ['alerts-default.component.scss']
})
export class AlertsDefaultComponent implements OnInit {
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
sbpro-alert(classes='alert-primary')
    | A primary alert—check it out!
`.trim();

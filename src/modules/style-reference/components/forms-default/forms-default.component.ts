import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CodeSample } from '@modules/style-reference/models';

@Component({
  selector: 'sbpro-forms-default',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forms-default.component.pug',
  styleUrls: ['forms-default.component.scss']
})
export class FormsDefaultComponent implements OnInit {
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
form
    .form-group
        label(for='exampleFormControlInput1') Email address
        input#exampleFormControlInput1.form-control(type='email', placeholder='name@example.com')
    .form-group
        label(for='exampleFormControlSelect1') Example select
        select#exampleFormControlSelect1.form-control
            option 1
            option 2
            option 3
            option 4
            option 5
    .form-group
        label(for='exampleFormControlSelect2') Example multiple select
        select#exampleFormControlSelect2.form-control(multiple='')
            option 1
            option 2
            option 3
            option 4
            option 5
    .form-group
        label(for='exampleFormControlTextarea1') Example textarea
        textarea#exampleFormControlTextarea1.form-control(rows='3')
`.trim();

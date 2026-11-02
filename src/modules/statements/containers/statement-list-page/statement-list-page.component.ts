import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { StatementsService } from '@modules/statements/services';

@Component({
  selector: 'sbpro-statement-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './statement-list-page.component.pug',
  styleUrls: ['statement-list-page.component.scss']
})
export class StatementListPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

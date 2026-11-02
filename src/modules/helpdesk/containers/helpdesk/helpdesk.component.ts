import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-helpdesk',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './helpdesk.component.pug',
  styleUrls: ['helpdesk.component.scss']
})
export class HelpdeskComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

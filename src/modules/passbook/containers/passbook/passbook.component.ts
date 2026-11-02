import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-passbook',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './passbook.component.pug',
  styleUrls: ['passbook.component.scss']
})
export class PassbookComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

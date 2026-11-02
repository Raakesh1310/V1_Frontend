import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-transfer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transfer.component.pug',
  styleUrls: ['transfer.component.scss']
})
export class TransferComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

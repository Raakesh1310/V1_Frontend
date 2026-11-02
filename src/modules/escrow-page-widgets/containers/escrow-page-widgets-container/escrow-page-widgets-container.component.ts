import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sbpro-escrow-page-widgets-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escrow-page-widgets-container.component.pug',
  styleUrls: ['escrow-page-widgets-container.component.scss']
})
export class EscrowPageWidgetsContainerComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

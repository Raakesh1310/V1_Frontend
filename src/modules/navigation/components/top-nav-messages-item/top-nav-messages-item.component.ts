import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Message } from '@modules/messages/models';

@Component({
  selector: 'sbpro-top-nav-messages-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-nav-messages-item.component.pug',
  styleUrls: ['top-nav-messages-item.component.scss']
})
export class TopNavMessagesItemComponent implements OnInit {
  @Input() message!: Message;
  constructor() {}
  ngOnInit() {}
}

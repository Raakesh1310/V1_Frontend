import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'sbpro-idle-time-out',
  templateUrl: './idle-time-out.component.pug',
  styleUrls: ['./idle-time-out.component.scss']
})
export class IdleTimeOutComponent implements OnInit {
  // @Input() private doClose: any;
  // @Input() private count: any;
  // @Output() passEntry: EventEmitter<any> = new EventEmitter();
  // timer = environment.TIMER;

  constructor() {}

  ngOnInit(): void {}

  // onClose() {
  //   this.passEntry.emit(true);
  //   this.doClose.close();
  // }
}

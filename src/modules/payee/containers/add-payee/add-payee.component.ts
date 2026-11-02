import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-add-payee-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-payee.component.pug',
  styleUrls: ['add-payee.component.scss']
})
export class AddPayeeComponent implements OnInit {

  @Input() showLeftAndTopNav : boolean = true;
  @Input() modal! : NgbModalRef;
  @Input() merchantId! : string;
  @Output() public emitCntrCloseModal: EventEmitter<boolean> = new EventEmitter();

  constructor() {}
  ngOnInit() {}

  modalEmit(flag: boolean){
    if (flag) {
      this.emitCntrCloseModal.emit(true);
    }
  }
}

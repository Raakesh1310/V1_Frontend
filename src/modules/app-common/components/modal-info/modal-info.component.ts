import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-modal-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal-info.component.pug',
  styleUrls: ['modal-info.component.scss']
})
export class ModalInfoComponent implements OnInit {
  @Input() private doClose: any;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();

  // private show: boolean;

  // @ViewChild('modalChild') modalDefault: Templ
  constructor(private modalService: NgbModal) {}

  onClose(resp: boolean) {
    this.passEntry.emit(resp);
    this.doClose.close();
  }

  ngOnInit() {
    // if(this.show){
    //     this.modalService.open()
    // }
  }
}

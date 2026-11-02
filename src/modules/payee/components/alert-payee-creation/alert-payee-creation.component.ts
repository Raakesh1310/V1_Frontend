import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-alert-payee-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert-payee-creation.component.pug',
  styleUrls: ['alert-payee-creation.component.scss']
})
export class AlertPayeeCreationComponent implements OnInit {
  @Input() result: boolean;

  constructor(public activeModal: NgbActiveModal) {
    this.result = true;
  }

  ngOnInit() {}
}

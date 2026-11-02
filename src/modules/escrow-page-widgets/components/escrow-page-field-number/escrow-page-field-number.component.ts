import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { EscrowPageFieldWidget } from '@modules/escrow-page-widgets/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import EscrowPageWidgetComponent from '../escrow-page-widget.class';

@Component({
  selector: 'sbpro-escrow-page-field-number',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escrow-page-field-number.component.pug',
  styleUrls: ['escrow-page-field-number.component.scss']
})
export class EscrowPageFieldNumberComponent extends EscrowPageWidgetComponent
  implements OnInit {
  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    super();
  }

  @Input() value!: string;
  // tslint:disable-next-line:no-any
  @Input() change: EventEmitter<any> = new EventEmitter<any>();
  errors: string[] = [];
  @ViewChild('defInput') defInput!: ElementRef;
  async informChanges(instance: EscrowPageFieldWidget) {
    console.log('method not implemented');
  }

  // tslint:disable-next-line:no-any
  updateValue = (_: any) => {};

  async validate() {
    this.errors = [];
    this.cdr.detectChanges();

    /**
     * check for required field
     */
    if (this.required) {
      if (this.defInput.nativeElement.value.length === 0) {
        this.errors.push(this.label + ' is required.');
        this.cdr.detectChanges();
        return false;
      }
    }

    /**
     * check for validation
     */

    if (this.verification) {
      console.log(`Verification logic not written yet for ${this.label} `);
    }

    return true;
  }

  onChange() {
    this.change.emit({
      value: this.defInput.nativeElement.value,
      label: this.label,
      required: this.required,
      verification: this.verification
    });
  }
  ngOnInit() {}

  registerOnChange(fn: any): void {
    this.updateValue = fn;
  }

  registerOnTouched(fn: any): void {}

  writeValue(value: string): void {
    this.value = value;
  }
  rmField() {
    this.remove.emit(true);
  }
}

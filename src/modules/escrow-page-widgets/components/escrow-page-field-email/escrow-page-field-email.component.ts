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
  selector: 'sbpro-escrow-page-field-email',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escrow-page-field-email.component.pug',
  styleUrls: ['escrow-page-field-email.component.scss']
})
export class EscrowPageFieldEmailComponent extends EscrowPageWidgetComponent
  implements OnInit {
  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    super();
  }

  @Input() value!: string;
  // tslint:disable-next-line:no-any
  @Input() change: EventEmitter<any> = new EventEmitter<any>();
  @Input() _detectName: EventEmitter<string> = new EventEmitter<string>();
  errors: string[] = [];
  @ViewChild('defInput') defInput!: ElementRef;
  async informChanges(instance: EscrowPageFieldWidget) {
    console.log('method not implemented');
  }

  // tslint:disable-next-line:no-any
  updateValue = (_: any) => {};

  onChange() {
    this.change.emit({
      value: this.defInput.nativeElement.value,
      label: this.label,
      required: this.required,
      verification: this.verification
    });
    if (this.label === 'Customer Name') {
      this._detectName.emit(this.defInput.nativeElement.value);
    }
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

  async validate() {
    this.errors = [];
    this.cdr.detectChanges();
    const re = /\S+@\S+\.\S+/;
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
     * field value validation
     */

    if (!re.test(this.defInput.nativeElement.value)) {
      this.errors.push(
        'Please enter a valid email address. Example: "john@gmail.com".'
      );
      this.cdr.detectChanges();
      return false;
    }

    /**
     * check for validation
     */

    if (this.verification) {
      console.log(`Verification logic not written yet for ${this.label} `);
    }

    return true;
  }
}

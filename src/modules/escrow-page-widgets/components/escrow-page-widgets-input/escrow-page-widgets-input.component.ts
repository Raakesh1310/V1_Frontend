import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import EscrowPageWidgetComponent from '@modules/escrow-page-widgets/components/escrow-page-widget.class';
import { EscrowPageFieldWidget } from '@modules/escrow-page-widgets/models';
import { AddFieldComponent } from '@modules/escrow-pages/components';
import { EscrowPageProductField } from '@modules/escrow-pages/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { EscrowPageFieldEditModalComponent } from '../escrow-page-field-edit-modal/escrow-page-field-edit-modal.component';

@Component({
  selector: 'sbpro-escrow-page-widgets-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escrow-page-widgets-input.component.pug',
  styleUrls: ['escrow-page-widgets-input.component.scss']
})
export class EscrowPageWidgetsInputComponent extends EscrowPageWidgetComponent
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
  editLabel() {
    const modalRef = this.modalService.open(EscrowPageFieldEditModalComponent, {
      windowClass: 'lg'
    });
    modalRef.componentInstance.doClose = modalRef;
    modalRef.componentInstance.label = this.label;
    modalRef.componentInstance.placeholder = this.placeholder;
    modalRef.componentInstance.required = this.required;
    modalRef.componentInstance.verification = this.verification;
    modalRef.componentInstance.type = this.type;

    // tslint:disable-next-line:no-any
    modalRef.componentInstance.passField.subscribe((resp: any) => {
      this.change.emit({
        value: this.defInput.nativeElement.value,
        label: resp.label,
        required: resp.required,
        verification: resp.verification
      });
      this.label = resp.label;
      this.placeholder = resp.placeholder;
      this.required = resp.required;
      this.verification = resp.verification;
      this.cdr.detectChanges();
    });
  }

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

  // onUpdateValue(event: Event) {
  //   const value = this.defInput.nativeElement.value;
  //   console.log({
  //     label: this.label,
  //     placeholder: this.placeholder,
  //     required: this.required,
  //     validation: this.validation
  //   });
  //   // this.updateValue({
  //   //   value: this.defInput.nativeElement.value,
  //   //   label: this.label,
  //   //   placeholder: this.placeholder,
  //   //   required: this.required,
  //   //   validation: this.validation
  //   // });
  //   this.change.emit({
  //     label: this.label,
  //     placeholder: this.placeholder,
  //     required: this.required,
  //     validation: this.validation
  //   });
  // }

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

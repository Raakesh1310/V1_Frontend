import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-add-field',
  templateUrl: './add-field.component.pug',
  styleUrls: ['./add-field.component.scss']
})
export class AddFieldComponent implements OnInit {
  @Input() private doClose?: NgbModalRef;
  @Input() private productForm = false;
  @Input() private customerForm = false;
  @Output() passField: EventEmitter<any> = new EventEmitter();
  errors: string[] = [];
  productFieldForm!: FormGroup;
  customerFieldForm!: FormGroup;
  // CustomerFieldForm!: FormGroup;
  predefinedField = ['Mobile', 'PAN', 'AADHAAR'];

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.productFieldForm = this.formBuilder.group({
      label: ['', Validators.required]
    });
    this.customerFieldForm = this.formBuilder.group({
      label: ['Mobile', Validators.required],
      type: ['text'],
      required: [true],
      removable: [true],
      verification: [true],
      placeholder: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  findInvalidControls(form: any) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.errors.push('Please enter a valid ' + name);
      }
    }
  }

  addProductField() {
    if (!this.productFieldForm.valid) {
      this.findInvalidControls(this.productFieldForm);
      this.cdr.detectChanges();
      return;
    }
    this.passField.emit(this.productFieldForm.controls.label.value);
    this.closer();
  }

  addCustomerField() {
    this.customerFieldForm.controls.placeholder.setValue('Enter ' + this.label);
    console.log(this.customerFieldForm.value);
    if (!this.customerFieldForm.valid) {
      this.findInvalidControls(this.customerFieldForm);
      this.cdr.detectChanges();
      return;
    }
    this.passField.emit(this.customerFieldForm.value);
    this.closer();
  }

  closer() {
    this.doClose?.close();
  }

  get label() {
    return this.customerFieldForm.controls.label.value;
  }

  get customField() {
    return !this.predefinedField.includes(this.label);
  }
}

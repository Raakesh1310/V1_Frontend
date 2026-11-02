import { Placeholder } from '@angular/compiler/src/i18n/i18n_ast';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from '@common/services';
import { EscrowPageChildPage } from '@modules/escrow-pages/models';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';

@Component({
  selector: 'sbpro-escrow-page-field-edit-modal',
  templateUrl: './escrow-page-field-edit-modal.component.pug',
  styleUrls: ['./escrow-page-field-edit-modal.component.scss']
})
export class EscrowPageFieldEditModalComponent implements OnInit {
  @Input() private doClose?: NgbModalRef;
  @Input() private selectOptions: string[] = ['custom', 'pan'];
  private type = 'custom';
  error: string = '';

  verificationFields: string[];
  requiredFields: string[];

  @Output() emitField: EventEmitter<any> = new EventEmitter();

  attrForm!: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private utilityService: UtilityService
  ) {
    this.verificationFields = environment.escrowPagesVerificationFields;
    this.requiredFields = environment.escrowPagesRequiredFields;
    console.log(this.requiredFields);
    this.attrForm = this.formBuilder.group({
      placeholder: ['placeholders'],
      required: [false],
      label: this.type.toUpperCase(),
      type: [this.type || 'custom'],
      verification: [false]
    });
    console.log(this.attrForm.value);
    console.log(environment.escrowPagesRequiredFields);
    console.log(environment.escrowPagesVerificationFields);
  }

  generateFieldId = () => {
    return new Date().getTime().toString();
  };

  ngOnInit(): void {
    console.log(this.type);
  }

  submitField() {
    if (!this.attrForm.controls.label.value) {
      this.error = 'Please prove a label.';
      return;
    }
    console.log('form: ', this.attrForm.value);
    const fields = {
      fieldId: this.generateFieldId(),
      index: 1,
      removable: true,
      value: null,
      editable: true,
      required: this.attrForm.controls.required.value,
      label:
        this.type === 'custom'
          ? this.attrForm.controls.label.value
          : this.type.toUpperCase(),
      placeholder: this.attrForm.controls.label.value,
      type: this.attrForm.controls.type.value,
      verification: this.attrForm.controls.verification.value
    };
    this.emitField.emit(fields);
    this.closer();
  }

  closer() {
    this.doClose?.close();
  }

  detectChanges() {
    this.attrForm.controls.type.setValue(this.type);
    this.cdr.detectChanges();
  }
}

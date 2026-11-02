import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { EscrowPageFieldWidget } from '@modules/escrow-page-widgets/models';
import { EscrowPageWidgetsService } from '@modules/escrow-page-widgets/services';

import EscrowPageWidgetComponent from '../escrow-page-widget.class';

@Component({
  selector: 'sbpro-escrow-page-field-aadhaar',
  templateUrl: './escrow-page-field-aadhaar.component.pug',
  styleUrls: ['./escrow-page-field-aadhaar.component.scss']
})
export class EscrowPageFieldAadhaarComponent extends EscrowPageWidgetComponent
  implements OnInit {
  constructor(
    private escrowPageService: EscrowPageWidgetsService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }
  @ViewChild('defInput') defInput!: ElementRef;
  errors: string[] = [];
  verified = false;

  @Input() placeholder!: string;
  writeValue(obj: any): void {
    throw new Error('Method not implemented.');
  }
  registerOnChange(fn: any): void {
    throw new Error('Method not implemented.');
  }
  registerOnTouched(fn: any): void {
    throw new Error('Method not implemented.');
  }

  async informChanges(instance: EscrowPageFieldWidget) {
    console.log('instance updated: ' + instance.type);
    console.log(instance);
  }

  ngOnInit() {}

  onChange() {
    this.change.emit({
      value: this.defInput.nativeElement.value,
      label: 'AADHAAR',
      required: this.required,
      verification: this.verification
    });
  }

  rmField() {
    this.remove.emit(true);
  }
  async validate() {
    this.errors = [];
    this.cdr.detectChanges();
    const re = /^\d{12}$/;
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

    if (
      this.defInput.nativeElement.value &&
      !re.test(this.defInput.nativeElement.value)
    ) {
      this.errors.push('Please enter a valid 12 digit AADHAAR number.');
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

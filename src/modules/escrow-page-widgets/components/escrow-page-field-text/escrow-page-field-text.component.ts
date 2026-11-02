import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { EscrowPageFieldWidget } from '@modules/escrow-page-widgets/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import EscrowPageWidgetComponent from '../escrow-page-widget.class';

@Component({
  selector: 'sbpro-escrow-page-field-text',
  templateUrl: './escrow-page-field-text.component.pug',
  styleUrls: ['./escrow-page-field-text.component.scss']
})
export class EscrowPageFieldTextComponent extends EscrowPageWidgetComponent
  implements OnInit {
  errors: string[] = [];
  @Input() value!: string;
  // tslint:disable-next-line:no-any
  @Input() change: EventEmitter<any> = new EventEmitter<any>();
  @Output() remove: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('defInput') defInput!: ElementRef;
  private editMode = false;

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    super();
    console.log(this);
  }

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

  informChanges(instance: EscrowPageFieldWidget) {
    if (instance.label === 'Deal/Property Name') {
      if (instance.value) {
        localStorage.setItem('escrow_page_bool', 'false');
      } else {
        localStorage.setItem('escrow_page_bool', 'true');
      }
    }
    console.log(instance);
  }

  editLabel() {
    this.editMode = true;
  }

  doneEdit() {
    console.log(this.value);
    this.editMode = false;
    this.change.emit({
      value: this.value,
      label: this.label,
      required: this.required,
      verification: this.verification
    });
  }

  // editLabel() {
  //   const modalRef = this.modalService.open(EscrowPageFieldEditModalComponent, {
  //     windowClass: 'lg'
  //   });
  //   modalRef.componentInstance.doClose = modalRef;
  //   modalRef.componentInstance.label = this.label;
  //   modalRef.componentInstance.placeholder = this.placeholder;
  //   modalRef.componentInstance.required = this.required;
  //   modalRef.componentInstance.verification = this.verification;
  //   modalRef.componentInstance.type = this.type;
  //   modalRef.componentInstance.value = this.value;

  //   modalRef.componentInstance.passField.subscribe((resp: any) => {
  //     this.change.emit({
  //       value: resp.value,
  //       label: resp.label,
  //       required: resp.required,
  //       verification: resp.verification
  //     });
  //     this.value = resp.value;
  //     this.label = resp.label;
  //     this.placeholder = resp.placeholder;
  //     this.required = resp.required;
  //     this.verification = resp.verification;
  //     this.cdr.detectChanges();
  //   });
  // }

  ngOnInit(): void {
  }

  rmField() {
    this.remove.emit(true);
  }
}

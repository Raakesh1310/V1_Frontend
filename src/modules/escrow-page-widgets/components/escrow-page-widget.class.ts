import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { EscrowPageFieldWidget } from '@modules/escrow-page-widgets/models';

enum EscrowPageWidgetMode {
  EDIT,
  VIEW
}

@Component({
  selector: 'sbpro-escrow-page-widgets'
})
export default abstract class EscrowPageWidgetComponent implements OnInit {
  private _mode!: EscrowPageWidgetMode;
  @Input() label!: string;
  @Input() formControlName!: string;
  @Input() formGroupName!: string;
  @Input() name!: string;
  @Input() value!: string | boolean;
  @Input() placeholder!: string;
  @Input() required!: boolean;
  @Input() type!: string;
  @Input() removable!: boolean;
  @Input() editable!: boolean;
  // tslint:disable-next-line:no-any
  @Input() change = new EventEmitter<any>();
  @Input() verification = false;
  @Input() remove = new EventEmitter<boolean>();
  @Input() livePage = false;

  // tslint:disable-next-line:no-any
  abstract informChanges(instance: EscrowPageFieldWidget): Promise<any> | void;
  abstract validate(): Promise<boolean>;

  // tslint:disable-next-line:no-any
  onChange() {}

  get mode(): EscrowPageWidgetMode {
    return this._mode;
  }

  set mode(value: EscrowPageWidgetMode) {
    this._mode = value;
  }

  protected constructor() {
    if (!this.formGroupName) {
      this.formGroupName = this.formControlName + 'group';
    }
  }

  ngOnInit(): void {}
}

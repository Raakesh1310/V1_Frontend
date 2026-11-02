import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'sbpro-transfer-type-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transfer-type-radio.component.pug',
  styleUrls: ['transfer-type-radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: TransferTypeRadioComponent
    }
  ]
})
export class TransferTypeRadioComponent
  implements OnChanges, ControlValueAccessor {
  constructor() {}

  @Input() isImpsAllowed: boolean = false;
  @Input() isFTAllowed: boolean = false;

  @Input() selectedTransferType: string = '';
  onChange: any = (type: string) => {};
  onTouched: any = null;

  disabled = false;
  touched = false;

  transferTypes = [
    { type: 'NEFT', desc: 'For all amounts, available on business days' },
    {
      type: 'RTGS',
      desc: 'For amount >= 2 Lacs, Cutoff time is 4 PM on business days'
    },
    {
      type: 'IMPS',
      desc: 'For amount <= Rs 5 Lacs, Available 24 x 7'
    },
    { type: 'FT', desc: 'For transfer to bank accounts in same bank' }
  ];

  transferTypeStringGuard(transferType: any) {
    if (typeof transferType !== 'string')
      throw new Error('transferType should be of type string');
  }

  writeValue(transferType: string): void {
    this.selectedTransferType = transferType;
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelect(transferType: string) {
    this.transferTypeStringGuard(transferType);

    if (this.isFTAllowed && transferType !== 'FT') return;

    this.selectedTransferType = transferType;
    this.onChange(transferType);
  }

  shouldDisplayIMPS(transferType: string) {
    return this.isImpsAllowed;
  }

  shouldDisplayFT(transferType: string) {
    this.transferTypeStringGuard(transferType);
    return transferType === 'FT' && this.isFTAllowed;
  }

  shouldDisplay(transferType: string) {
    this.transferTypeStringGuard(transferType);

    // if (!this.isFTAllowed) {
    //   this.selectedTransferType = 'NEFT';
    // }

    if (transferType !== 'IMPS' && transferType !== 'FT') return true;
    else if (transferType === 'IMPS') return this.isImpsAllowed;
    else if (transferType === 'FT') {
      if (this.isFTAllowed) {
        this.selectedTransferType = 'FT';
      }
      return this.isFTAllowed;
    }
  }

  ngOnInit() {
    console.log(this.selectedTransferType);
  }

  ngOnChanges() {
    console.log(this.selectedTransferType);
  }
}

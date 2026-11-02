import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnInit,
  Renderer2
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface AppButtonClass {
  btn: boolean;
  'btn-block': boolean;
  'btn-primary': boolean;
  'btn-warning': boolean;
  'btn-sm': boolean;
}

@Component({
  selector: 'sbpro-app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-button.component.pug',
  styleUrls: ['app-button.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppButtonComponent),
      multi: true
    }
  ]
})
export class AppButtonComponent
  implements OnInit, ControlValueAccessor, AfterViewInit {
  @Input() private text!: string;
  @Input() private loadingText!: string;
  // tslint:disable-next-line:ban-types
  onChange!: Function;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() routerLink!: string;
  @Input() buttonStyle: string | number = "bc8e32";
  buttonColor = `#`;
  @Input() btnClass!: AppButtonClass;
  private fullWidth = false;

  constructor(
    private host: ElementRef<HTMLInputElement>,
    private renderer2: Renderer2,
    private compRef: ElementRef
  ) {
  }

  ngOnInit() {
    // console.log('working');
    this.buttonColor = this.buttonColor + this.buttonStyle.toString();
    // this.inputButton.classList.push('yes');
    try {
      if (!this.btnClass) {
        this.btnClass = { btn: true, 'btn-primary': true } as AppButtonClass;
      }
      if ('btn-block' in this.btnClass) {
        this.fullWidth = true;
        this.renderer2.addClass(this.host.nativeElement, 'w-100');
      }
    } catch (e) {
      console.error(e);
    }
  }

  ngAfterViewInit() {
    // console.log('working');
    // this.inputButton.classList.push('yes');
  }

  // tslint:disable-next-line:no-any
  writeValue(value: any) {
    // clear file input
    this.host.nativeElement.value = value;
  }

  // tslint:disable-next-line:ban-types
  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  // tslint:disable-next-line:ban-types
  registerOnTouched(fn: Function) { }

  setDisabledState(isDisabled: boolean): void {
    // const div = this.textarea.nativeElement;
    // const action = isDisabled ? 'addClass' : 'removeClass';
    // this.renderer[action](div, 'disabled');
    this.disabled = isDisabled;
  }
}

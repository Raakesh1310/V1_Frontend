import { Directive, ElementRef, HostListener } from '@angular/core';
import { alphaNumericRegex } from '@modules/transfers/constants/notesKeyInputRegEx';


@Directive({
  selector: '[alphaNumericInput]'
})
export class AlphaNumericDirective {
  private regex: RegExp = new RegExp(alphaNumericRegex);
  private specialKeys: Array<string> = ['Backspace', 'Space', 'Tab', 'End', 'Home'];

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    let next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}

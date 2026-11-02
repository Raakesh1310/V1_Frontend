import { Directive, ElementRef, HostListener } from '@angular/core';


@Directive({
  selector: '[mobileNumber]'
})
export class MobileNumberDirective {
  private regex: RegExp = new RegExp(/^\d{1,10}$/g);
  private specialKeys: Array<string> = ['Backspace','Delete','Tab'];


  constructor(private el: ElementRef) {
  }


  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    console.log(this.el.nativeElement.value); // will give input field value on which it is map..
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    const position = this.el.nativeElement.selectionStart; // gives position of element..
    const next: string = [current.slice(0, position),event.key, current.slice(position)].join('');
    //console.log("NEXT ",next);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}

import {
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  Input,
  OnInit,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[sbproEscrowPageField]'
})
export class EscrowPageFieldDirective implements OnInit {
  @Input() type!: string;

  constructor(
    private renderer2: Renderer2,
    private el: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.type = 'input';
  }

  ngOnInit(): void {
    const div = this.renderer2.createElement('div');
    const text = this.renderer2.createText(this.type);
    this.renderer2.appendChild(div, text);
    this.renderer2.appendChild(this.el.nativeElement, div);
  }
}

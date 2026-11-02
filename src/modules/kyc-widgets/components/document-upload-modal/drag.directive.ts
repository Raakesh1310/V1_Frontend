import {
  Directive,
  HostBinding,
  HostListener,
  Output,
  EventEmitter
} from "@angular/core";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


@Directive({
  selector: "[appDrag]",
})

export class DragDirective {

  @Output() files = new EventEmitter();

  //@HostBinding("style.background") private background = "#eee";

  constructor(private sanitizer: DomSanitizer) {

  }

  @HostListener("dragover", ["$event"]) public onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    //this.background = "#999";
  }

  @HostListener("dragleave", ["$event"]) public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    //this.background = "#eee";
  }

  @HostListener('drop', ['$event']) public onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    //this.background = '#eee';
    // @ts-ignore
    if (evt.dataTransfer.files.length > 0) {
      // @ts-ignore
      this.files.emit(evt.dataTransfer.files[0]);
    }
  }
}

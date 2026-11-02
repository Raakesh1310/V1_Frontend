import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'sbpro-file-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-input.component.pug',
  styleUrls: ['file-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInputComponent),
      multi: true
    }
  ]
})
export class FileInputComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() fileUrl!: string;
  @Input() fileTitle!: string;
  @Input() accept: string = '*';
  widgetLabel!: string;
  @Output() fileSelect: EventEmitter<FileList> = new EventEmitter();
  private files = [];
  // tslint:disable-next-line:ban-types
  onChange!: Function;

  // constructor() { }

  ngOnInit() {
    this.updateSelectedFile(this.fileTitle, this.fileUrl);
  }

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    try {
      // Update First File
      const firstFile = event.item(0);
      if (firstFile) {
        this.updateSelectedFile(firstFile.name, firstFile.name);
        this.onChange(event);
      }
    } catch (e) {
      console.error(e);
    }
  }

  constructor(private host: ElementRef<HTMLInputElement>) {
    this.updateSelectedFile('', '');
  }

  writeValue(value: null) {
    // clear file input
    this.host.nativeElement.value = '';
  }

  // tslint:disable-next-line:ban-types
  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  // tslint:disable-next-line:ban-types
  registerOnTouched(fn: Function) {}

  setDisabledState(isDisabled: boolean): void {
    // const div = this.textarea.nativeElement;
    // const action = isDisabled ? 'addClass' : 'removeClass';
    // this.renderer[action](div, 'disabled');
    this.disabled = isDisabled;
  }

  handleFileInputSelect(event: FileList) {
    try {
      // this.updateSelectedFile(
      //   event.target.files.item(0).name,
      //   event.target.files.item(0).name
      // );
      // this.onFileSelect.emit(event.target.files);
    } catch (e) {
      console.error(e);
      this.updateSelectedFile('', '');
    }
  }

  /**
   * This function basically updates the given
   * value: Title, Url
   * and update the widet value for the same
   *
   * @param title which will be visible on the Widget
   * @param url Link to which the anchor tag will target to
   */
  updateSelectedFile(title: string, url: string) {
    this.fileTitle = title;
    this.fileUrl = url;

    this.widgetLabel = this.fileTitle || this.placeholder;
  }

  // tslint:disable-next-line:no-any
  handleLabelClick(event: any) {
    /**
     * Check for disabled attribute first
     * if disabled is set to true
     * then we will not entertain the click event
     */
    if (this.disabled) {
      return;
    }

    /**
     * Check for the file existance
     * if File is exists then we will remove
     * the selected file
     */
    if (this.hasFileUrl()) {
      this.updateSelectedFile('', '');
    }
    console.log('label clicked');
    console.log(event);
  }

  hasFileUrl() {
    return !!this.fileUrl;
  }

  isFileSelected() {
    return true;
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

interface uploadFile {
  name: string;
  file: File;
}

@Component({
  selector: 'sbpro-file-upload',
  templateUrl: './file-upload.component.pug',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  files: Array<uploadFile> = [];
  @Output() fileChanged: EventEmitter<Array<uploadFile>> = new EventEmitter();
  @Input() multi = true;
  hideButton = false;

  constructor() {}

  ngOnInit(): void {}

  docUp() {
    const element: HTMLElement = document.getElementById(
      'ndocs'
    ) as HTMLElement;
    element.click();
  }

  onfileChange($event: any) {
    if (!this.multi) {
      this.hideButton = true;
    }
    this.files.push({
      name: $event.target.files[0].name,
      file: $event.target.files[0]
    });
    this.fileChanged.emit(this.files);
    $event.target.value = '';
  }

  removeFile(index: number) {
    if (!this.multi) {
      this.hideButton = false;
    }
    this.files.splice(index, 1);
    this.fileChanged.emit(this.files);
  }
}

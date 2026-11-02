import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef,
  EventEmitter, Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { UtilityService } from '@common/services';

@Component({
  selector: 'sbpro-document-upload-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-upload-modal.component.pug',
  styleUrls: ['./document-upload-modal.component.scss']
})
export class DocumentUploadModalComponent implements OnInit {

  @Output() uploadData = new EventEmitter();
  @Output() dismissModal: EventEmitter<Function> = new EventEmitter();
  @Output() closeModal: EventEmitter<Function> = new EventEmitter();
  @Input() imgSrc : string | ArrayBuffer | null = "";

  @Input() documentType?: string = "";
  @Input() isLoading?: boolean = false;

  @ViewChild('inputFile') inputFile!: ElementRef;
  aadharNumber! : number;
  panName = "";
  panNumber = "";
  fileType = false;
  pdfName = "";
  validateAadhar = "";

  constructor(
    private cdr: ChangeDetectorRef,
    private utilityService: UtilityService
  ) {
  }

  ngOnInit(): void {
    console.log("DOCUMENT TYPE ", this.documentType);
  }

  openSelectionBox() {
    this.inputFile.nativeElement.click();
  }

  dataUploaded(event: any) {
    let file = event.target.files[0];
    console.log(file);
    this.fileType = file.type.toString().endsWith("pdf");
    this.pdfName = file.name;
    this.cdr.detectChanges();
  }

  aadharValidator(event: any) {
    let value: string = event.key;
    if (
      value === 'Backspace' ||
      value === 'Delete' ||
      value === 'ArrowRight' ||
      value === 'ArrowLeft'
    ) { 
      return true;
    }

    value = event.target.value + event.key;
    let validation = (value.length > 12 || !/^[-+]?[0-9]*\.?[0-9]*$/.test(value)) ? false : true;

    if (
      validation
    ) {
      this.validateAadhar = value
      this.cdr.detectChanges();
      return true;
    }
    return false
  }

  // closeModal() {
  //   this.modalRef?.close();
  //   this.cdr.detectChanges();
  // }

}

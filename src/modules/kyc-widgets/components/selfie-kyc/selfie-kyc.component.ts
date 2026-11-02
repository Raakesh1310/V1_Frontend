import {
  AfterViewInit, ChangeDetectionStrategy,
  ChangeDetectorRef, Component,
  ElementRef, EventEmitter, Input,
  OnInit, Output,
  ViewChild
} from '@angular/core';
import { environment } from '../../../../environments/environment';
import { KycWidgetsService } from '@modules/kyc-widgets/services';


enum permissionStatus {
  granted,
  denied,
  pending,
}

@Component({
  selector: 'sbpro-selfie-kyc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './selfie-kyc.component.pug',
  styleUrls: ['./selfie-kyc.component.scss']
})

export class SelfieKycComponent implements OnInit, AfterViewInit {

  @Output() dismissModal: EventEmitter<Function> = new EventEmitter();
  @Output() captureImg: EventEmitter<Function> = new EventEmitter();
  isLoading = false;
  //isCameraPermissionAllowed = false;
  @ViewChild('video') video!: ElementRef;
  @ViewChild('canvas') canvas!: ElementRef;
  @Input() crnId = '';
  imgSrc = '';
  imgCaptured = false;
  imgFile!: File;
  permissionCheck : permissionStatus = permissionStatus.pending;

  constructor(private cdr: ChangeDetectorRef, private kycService: KycWidgetsService) {
  }

  ngOnInit(): void {
    console.log(this.crnId);
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      console.log('VIDEO ', this.video);
      console.log('STREAM ', stream);
      if (stream) {
        //this.isCameraPermissionAllowed = true;
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();
        this.permissionCheck = permissionStatus.granted;
        this.cdr.detectChanges();
      }
    }).catch((err) => {
      console.log('Error ', err);
      if(err.toString().includes('Permission denied')) {
        this.kycService.showToast('Error','You have denied camera Permission' , {
          headerClasses: 'bg-danger text-white'
        });
      }else {
        this.kycService.showToast('Error',err , {
          headerClasses: 'bg-danger text-white'
        });
      }
      this.permissionCheck = permissionStatus.denied;
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void {
  }

  captureImage() {
    let context = this.canvas.nativeElement.getContext('2d');
    console.log(this.video);
    context.drawImage(this.video.nativeElement, 0, 0, 300, 200);
    this.convertCanvasToImage(this.canvas.nativeElement);
  }

  convertCanvasToImage(canvas: HTMLCanvasElement) {
    let image = new Image();
    image.src = canvas.toDataURL('image/png');
    this.imgSrc = image.src;
    this.imgCaptured = true;
    //console.log(image.src);
    let File: File = this.dataURLtoFile(image.src, 'Photo.png');
    this.imgFile = File;
    console.log(File);
    this.cdr.detectChanges();
  }

  dataURLtoFile(dataurl: string, filename: string): File {
    let arr = dataurl.split(',');
    //if (arr.length > 0) {
    let mime = arr[0].match(/:(.*?);/)![1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
    //}
  }

  stopStreamedVideo(videoElem: ElementRef) {
    console.log(videoElem);
    const stream = this.video.nativeElement.srcObject;
    const tracks = stream?.getTracks();

    if (tracks) {
      tracks.forEach(function(track: any) {
        track.stop();
      });
    }
    this.video.nativeElement.srcObject = null;
    this.cdr.detectChanges();
  }

  postKycDocs(body: File, fieldName: string) {
    this.isLoading = true;
    this.cdr.detectChanges();
    const formData = new FormData();
    formData.append('file', body);
    let url = environment.apiPrefix + `/kyclink/${this.crnId}/upload/${fieldName}`;
    this.kycService.postDocuments(url, formData).subscribe(
      async (resp: any) => {
        console.log('RESPONSE FROM INDIVIDUAL DOCUMENTS ', resp);
        if (resp.success) {
          //await this.dismissModal.emit();
          this.stopStreamedVideo(this.video);
          // @ts-ignore
          await this.captureImg.emit(this.imgSrc);
          let toastHead = 'Success';
          let toastBody = `${resp.result.type} document successfully Uploaded.`;
          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-success text-white'
          });
          this.isLoading = false;
        } else {
          console.log('ERROR ', resp.errors);
        }
        this.cdr.detectChanges();
      },
      err => {
        console.log('ERROR FROM API SIDE ', err);
        if (err.status === 0) {
          console.log('Connection Error');
        } else {
          console.log(err.error.errors);
          let toastHead = 'Document Error';
          let toastBody = err.error.errors;

          this.kycService.showToast(toastHead, toastBody, {
            headerClasses: 'bg-danger text-white'
          });
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    );
  }


}

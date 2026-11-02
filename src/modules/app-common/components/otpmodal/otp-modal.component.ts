import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { UtilityService } from '@common/services';
import { OTPResponseModel } from '@modules/auth/models/otp-response.model';
import { AuthService } from '@modules/auth/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sbpro-otp-modal',
  templateUrl: './otp-modal.component.pug',
  styleUrls: ['./otp-modal.component.scss']
})
export class OtpModalComponent implements OnInit {
  error = '';
  timer = false;
  templateId = '';
  // mobile = this.authService.getMobile();
  email = this.authService.getEmail();
  counter = 30;
  @Input() private merchantName = '';
  @Input() private mobile: number | null | undefined;
  @Input() private header: string = '';
  @Input() private doClose: any;
  @Input() private type = 'mobile';
  @Input() private emailTemplate = '';
  @Input()
  private message =
    this.type === 'mobile'
      ? `An OTP has been sent to your registered mobile number.`
      : `An OTP has been sent to your registered email ${this.email}`;
  @Output() passOtp: EventEmitter<any> = new EventEmitter();

  private _resetOtpInterval!: NodeJS.Timeout;

  constructor(
    public activeModal: NgbActiveModal,
    private utilityService: UtilityService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log(this.type);
    if (this.type === 'email') {
      this.utilityService.sendMailOTP(this.emailTemplate).subscribe();
      return;
    }
    this.utilityService
      .sendOTP(this.templateId, this.mobile ? this.mobile : null, {
        merchantName: this.merchantName
      })
      .subscribe();

    this.header;
  }

  // onClose(resp: boolean) {
  //   this.passEntry.emit(resp);
  //   this.doClose.close();
  // }

  resendOTP() {
    if (this.type === 'email') {
      this.utilityService.sendMailOTP(this.emailTemplate).subscribe();
      this.timer = true;
      this._resetOtpInterval = setInterval(() => {
        this.counter -= 1;
        if (this.counter === 0) {
          this.timer = false;
          this.counter = 30;
          clearInterval(this._resetOtpInterval);
        }
      }, 1000);
      return;
    }
    //Return in case timer running
    if (this.timer === true) return;
    //Call resend endpoint
    this.utilityService
      .resendOTP(this.templateId, this.mobile ? this.mobile : null, {
        merchantName: this.merchantName
      })
      .subscribe(
      (resp: OTPResponseModel) => {
        console.log(resp);
        this.cdr.detectChanges();
      },
      err => {
        console.log(err);
        if (err.status === 0) {
          this.error = 'Connection Error';
        }
        this.error = err.error.errors[0];
        this.cdr.detectChanges();
      });
    this.timer = true;
    const resendOtp = setInterval(() => {
      this.counter -= 1;
      if (this.counter === 0) {
        this.timer = false;
        this.counter = 30;
        clearInterval(resendOtp);
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  verifyOTP(otp: number) {
    if (!otp) {
      this.error = 'Please enter an OTP';
      this.cdr.detectChanges();
      return;
    }

    if (this.type === 'email') {
      this.utilityService.verifyMailOTP(otp).subscribe(
        (resp: any) => {
          if (resp.success) {
            this.doClose.close(true);
          }
        },
        err => {
          this.error = err.error.message;
          this.cdr.detectChanges();
        }
      );
      return;
    }

    this.passOtp.emit(otp);
    this.closer();
  }

  closer() {
    this.doClose.close();
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { ToastMessageData, ToastMessageOptions } from '@common/models';
import { ToastService } from '@common/services';
import {
  FixedDepositDetail,
  FixedDepositInput,
  FixedDepositResp
} from '@modules/fixed-deposit/models';
import { FixedDepositService } from '@modules/fixed-deposit/services';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'sbpro-fd-close',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fd-close.component.pug',
  styleUrls: ['fd-close.component.scss']
})
export class FdCloseComponent implements OnInit {
  @Input() fd?: FixedDepositDetail;
  interest: number | null = null;
  error = '';
  @Input() doClose?: NgbModalRef;
  partialSelected: Boolean = false;
  partialClosureAmount: number | null = null;

  constructor(
    private fdService: FixedDepositService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit() {
  }

  update() {
    if (typeof (this.interest) !== 'number' || this.interest < 0) {
      this.error = 'Please enter Interest Amount.';
      return;
    }
    if (this.partialSelected && this.fd) {
      if (typeof (this.partialClosureAmount) !== 'number' || this.partialClosureAmount < 0 || this.partialClosureAmount > Number.parseFloat(this.fd.amount)) {
        this.error = 'Please enter Partial Amount.';
        return;
      }
    }
    this.fdService
      .updateInterest(this.interest, this.fd?.fixedDepositId, this.partialClosureAmount)
      .subscribe(
        (resp: FixedDepositResp) => {
          console.log(resp);
          if (resp.success) {
            this.showToast('Success', 'FD closed successfull.', {
              headerClasses: 'bg-success text-white'
            });
            this.doClose?.close(true);
          }
        },
        err => {
          this.showToast('Failed', 'Failed to close FD.', {
            headerClasses: 'bg-danger text-white'
          });
          this.doClose?.close(false);
        }
      );
  }

  closeModal() {
    this.doClose?.close(false);
  }

  onItemChange(eventValue: string) {
    this.partialSelected = eventValue == 'true';
    this.cdr.detectChanges();
    console.log("Event Value: ", eventValue);
  }

  showToast(
    header: ToastMessageData,
    body: ToastMessageData,
    options: ToastMessageOptions = {}
  ) {
    const defaultOptions = {
      autohide: true,
      delay: 5000
    };
    this.toastService.show(header, body, { ...defaultOptions, ...options });
  }
}

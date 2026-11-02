import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { TransfersService } from '@modules/transfers/services';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'sbpro-scheduled-transfer-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scheduled-transfer-detail.component.pug',
  styleUrls: ['scheduled-transfer-detail.component.scss']
})
export class ScheduledTransferDetailComponent implements OnInit {
  scheduledTransfer: any;
  scheduledTransferId: string = '';
  errors: string[] = [];
  constructor(
    public transferService: TransfersService,
    public changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location

  ) {}
  ngOnInit() {
    console.log('Routing data ' + this.route.snapshot.params.id);
    this.scheduledTransferId = this.route.snapshot.params.id;
    console.log('calling schedule transfer api -->>>-->>>->>>');
    this.transferService
      .scheduleTransferDetails(this.scheduledTransferId)
      .subscribe(
        (resp: any) => {
          console.log('got response --===--==-->>>>', resp);

          this.scheduledTransfer = resp.result;

          this.changeDetectorRef.detectChanges();
        },
        error => {
          this.errors.push(error);
          console.log(this.errors);
          this.changeDetectorRef.detectChanges();
        },
        () => {
          // 'onCompleted' callback.
          // No errors, route to new page here
          this.changeDetectorRef.detectChanges();
        }
      );
  }

   goBack() {
    // this.router.navigate([`/super-admin/merchant/${this.merchantId}`]);
    this.location.back();
  }

  objKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getParsedDate(date: string) {
    return new Date(date).toLocaleString();
  }
}

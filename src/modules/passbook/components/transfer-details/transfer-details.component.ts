import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit
} from '@angular/core';
import { UtilityService } from '@common/services';
import { AuthService } from '@modules/auth/services';
import { TransferDocumentInterface } from '@modules/passbook/models/document.model';
import { ProfileService } from '@modules/profile/services';
import { Transfer } from '@modules/transfers/models';
import { TransfersService } from '@modules/transfers/services';
import { TransferDocumentService } from '@modules/transfers/services/transfer-document.service';
import { S3FolderName } from '@modules/vpa/constants/s3FolderNameConstants';
import * as date from 'date-and-time';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'sbpro-transfer-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transfer-details.component.pug',
  styleUrls: ['transfer-details.component.scss']
})
export class TransferDetailsComponent implements OnInit {
  @Input() transferId!: string;
  @Input() merchantId = '';
  docUrlPrefix = environment.apiHost + '/uploads/transfers/single-transfers/';
  transfer: Transfer = {} as Transfer;
  reportUrl = '';
  isAdmin = false;
  supportingDocuments: TransferDocumentInterface[] = [];
  upiPayoutEnabled = false;
  downloadFolderName = S3FolderName.SINGLE_TRANSFERS;
  /**
   * Behaviour subject for
   * lazy loading the data
   * through network call
   */
  private _loadingData$ = new BehaviorSubject(false);

  get loadingData$(): Observable<boolean> {
    return this._loadingData$.asObservable();
  }

  constructor(
    private transferService: TransfersService,
    private transferDocumentService: TransferDocumentService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private profileService: ProfileService,
    private utilityService: UtilityService
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
  }

  goBack() {
    window.history.back();
  }

  downloadFile($event: Event, docHash: string, docName?: string) {
    this.utilityService.downloadFile(
      $event,
      docHash,
      this.downloadFolderName,
      docName
    );
  }

  getParsedDate(inputDate: Date) {
    if (!inputDate) {
      return '';
    }
    const d = new Date(inputDate);
    return date.format(d, 'DD MMM YYYY');
  }

  ngOnInit() {
    this.profileService
      .getProfile(this.merchantId ? this.merchantId : null, false)
      .subscribe((resp: any) => {
        this.upiPayoutEnabled = resp.result.upiPayoutEnabled;

        this.cdr.detectChanges();
      });

    const params: any = { token: this.authService.getBearerToken() };
    let paramsSerialized = '';

    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }
    this.reportUrl = this.isAdmin
      ? environment.apiPrefix +
        `/super-admin/transfer/${this.transferId}/report/download?` +
        paramsSerialized
      : environment.apiPrefix +
        `/transfer/${this.transferId}/report/download?` +
        paramsSerialized;
    /**
     * Load the transfer entries
     * using the transfer service
     */
    this._loadingData$.next(true);
    this.transferService.findOne({ transferId: this.transferId })?.subscribe(
      resp => {
        console.log(resp);
        this.transfer = resp.result;
        this.cdr.detectChanges();
      },
      err => {
        this.transfer = {} as Transfer;
        console.log(err);
        this.cdr.detectChanges();
      }
    );

    this.transferDocumentService.find(this.transferId).subscribe(
      (resp: any) => {
        this.supportingDocuments = (resp.result as TransferDocumentInterface[])?.map(
          document => {
            return {
              ...document,
              fileURL:
                environment.apiPrefix + '/transfer/download/' + document.hash
            };
          }
        );
        this.cdr.detectChanges();
      },
      err => {
        console.log(err);
        this.cdr.detectChanges();
      }
    );
  }
}

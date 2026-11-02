import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateParserService } from '@common/services/NgbDateParser.service';
import { AuthService } from '@modules/auth/services';
import { EscrowQrService } from '@modules/escrow-qr/services';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { Location } from '@angular/common';

@Component({
  selector: 'sbpro-escrow-qr-data',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './escrow-qr-data.component.pug',
  styleUrls: ['escrow-qr-data.component.scss']
})
export class EscrowQrDataComponent implements OnInit {
  escrowQrData: any = [];
  page = 1;
  pageSize: number = 10;
  errors = [];
  searchTerm: string = '';
  startDate!: NgbDateStruct;
  endDate!: NgbDateStruct;
  startTimeStamp = 0;
  endTimeStamp = 0;
  maxDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getUTCDate()
  };
  total!: number;
  isAdmin = false;
  downloadLink = '';
  constructor(
    private _location: Location,
    private dateParser: NgbDateParserService,
    private escrowQRService: EscrowQrService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isSuperAdmin();
  }
  ngOnInit() {
    this.startDate = { year: 0, day: 0, month: 0 };
    this.endDate = { year: 0, day: 0, month: 0 };
    this.searchTerm = '';
    this.getEscrowQRList({ page: this.page });
  }

  startDateChange() {
    //console.log("EVENT ",event);
    console.log('DATE Start ', this.startDate);
    let date = new Date(
      this.startDate.year,
      this.startDate.month - 1,
      this.startDate.day,
      new Date().getHours(),
      new Date().getMinutes(),
      new Date().getSeconds()
    );
    this.startTimeStamp = date.getTime();
    console.log('TIMESTAMP 1 ', date.getTime());
  }

  endDateChange() {
    //console.log("EVENT ",event);
    console.log('DATE End ', this.endDate);
    let date = new Date(
      this.endDate.year,
      this.endDate.month - 1,
      this.endDate.day,
      new Date().getHours(),
      new Date().getMinutes(),
      new Date().getSeconds()
    );
    this.endTimeStamp = date.getTime();
    console.log('TIMESTAMP 2 ', date.getTime());
  }

  filterData() {
    this.errors = [];
    console.log('FILTERING DATA ');
    const params: any = {};

    if (this.startDate?.year > 2010) {
      params.dateFrom = new Date(
        this.dateParser.format(this.startDate)
      ).toISOString();
    }
    if (this.endDate?.year > 2010) {
      params.dateTo = new Date(
        this.dateParser.format(this.endDate)
      ).toISOString();
    }
    if (this.searchTerm.length > 0) {
      params.s = this.searchTerm.trim();
    }

    this.page = 1;

    console.log('PARAMS ', params);
    this.getEscrowQRList(params);
  }

  getEscrowQRList(params: object) {
    this.activatedRoute.paramMap.subscribe(resp => {
      // this.spinner.show();
      this.escrowQRService
        .getEscrowQrData(resp.get('id') || '', params)
        .subscribe(
          (resp: any) => {
            if (resp.success) {
              if (resp.result) {
                this.escrowQrData = resp.result;
                this.total = resp.allItemsCount;
                console.log(this.escrowQrData);
                // this.spinner.hide();
                this.cdr.detectChanges();
              }
            }
          },
          error => {
            this.errors = error;
            // this.spinner.hide();
            this.cdr.detectChanges();
          },
          () => {
            // 'onCompleted' callback.
            // No errors, route to new page here
          }
        );

      this.updateDownloadLink(resp.get('id') || '');
    });
  }

  updateDownloadLink(refId: string) {
    const params: any = {
      token: this.authService.getBearerToken(),
      page: -1
    };

    if (this.searchTerm.length > 0) {
      params.s = this.searchTerm.trim();
    }

    let paramsSerialized = '';

    for (const paramsKey in params) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${paramsKey}=${params[paramsKey]}`;
    }
    this.downloadLink = this.isAdmin
      ? environment.apiPrefix +
        `/super-admin/escrow-qr/${refId}/download?` +
        paramsSerialized
      : environment.apiPrefix +
        `/escrow-qr/${refId}/download?` +
        paramsSerialized;

    this.cdr.detectChanges();
  }

  pageChange(event: any) {
    console.log('PAGE ', this.page);
    console.log('PAGE EVENT ', event);
    const params: any = { page: this.page };
    if (this.searchTerm.length > 0) {
      params.s = this.searchTerm.trim();
    }

    this.getEscrowQRList(params);
  }

  openDetails(id: string) {
    this.router.navigate([environment.urlAdminPrefix + '/transaction/' + id]);
  }

  goBack() {
    // this._location.back();
    window.history.back()
  }
}

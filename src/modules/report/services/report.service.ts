import { HttpParams, HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilityService } from '@common/services';
import banksTypes from '@modules/accounts/constants/banksTypes';
import { AuthService } from '@modules/auth/services';
import { environment } from 'environments/environment';
import { BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ReportService {
  private _reportData$ = new BehaviorSubject<any[]>([]);
  private _loading$ = new BehaviorSubject(false);
  private _totalItems$ = new BehaviorSubject<Number>(0);
  private _page: Number = 1;
  isAdmin: boolean = false;
  private templateIds: any = {
    Accounts: ['template_allAccountsDE', 'template_allAccountsCB'],
    Payee: 'template_allPayees',
    Deposit: ['template_DepositListDE', 'template_DepositListCB'],
    Transfers: ['template_allTransferDE', 'template_allTransferCB'],
    Statement: ['template_AllStatementsDE', 'template_AllStatementsCB']
  }

  constructor(private httpClient: HttpClient, private utitlityService: UtilityService, private authService: AuthService) {
    this.isAdmin = this.authService.isSuperAdmin();
  }

  getReport$() {
    try {
      const httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      this._loading$.next(true);
      this._reportData$.next([]);
      this._totalItems$.next(0);
      const params: any = {};
      params.page = this.page;
      let url = environment.ReportServiceHost + '/report';
      if (this.isAdmin) url = environment.ReportServiceHost + '/super-admin/report';
      return this.httpClient.get<any>(url, { headers: httpHeaders, params }).pipe(
        map((resp: any) => {
          if (resp) {
            console.log(JSON.stringify(resp));
            this._reportData$.next(resp.result.data);
            this._totalItems$.next(resp.result.totalCount);
            this._loading$.next(false);
          }
          // this.cdr.detectChanges();
        }),
        catchError(error => {
          console.log(error);
          this._loading$.next(false);
          this._reportData$.next([]);
          this._totalItems$.next(0);
          throw error
        })
      )
    } catch (error) {
      console.log(error);
    }
  }

  generateReport(requestBody: any, isAdmin: boolean = false) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = environment.ReportServiceHost + '/report';
    if (isAdmin) url = environment.ReportServiceHost + '/super-admin/report';
    return this.httpClient.post<any>(url, requestBody);
  }

  getBankAccounts(
    merchantId: string = '',
    bank: string = '',
    isAdmin: string = '',
    upi: boolean = false
  ) {
    let params = new HttpParams();
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (upi) {
      params = params.set('upi', 'true');
    }
    if (merchantId) {
      params = params.set('merchantId', merchantId as string);
    }
    if (bank) {
      if (bank === 'yes' || bank === 'YES') {
        bank = banksTypes.YES_BANK;
      }
      params = params.set('bank', bank.toLowerCase());
    }

    let url = isAdmin
      ? environment.apiPrefix +
      '/' +
      environment.urlAdminPrefix +
      `/bank-account`
      : environment.apiPrefix + `/bank-account`;

    return this.httpClient.get(url, { headers: httpHeaders, params });
  }

  get reportData$() {
    return this._reportData$.asObservable();
  }

  get loading$() {
    return this._loading$.asObservable();
  }

  get totalItems$() {
    return this._totalItems$.asObservable();
  }

  get page() {
    return this._page;
  }

  set page(page: Number) {
    this._page = page;
    this.getReport$();

  }

  getTemplateId(selectedReport: string = '', isDigital: boolean = true) {
    const template = this.templateIds[selectedReport];
    if (Array.isArray(template)) {
      return isDigital ? template[0] : template[1];
    }
    return template;
  }

  downloadReport(id: string = '', type: string = '') {
    let url = environment.ReportServiceHost + '/report/' + id + '/download';
    return this.httpClient.get<any>(url, { responseType: 'blob' as 'json' }).subscribe((blob: Blob) => {
      const fileName = type + 'report' + "-" + id;
      this.utitlityService.saveFile(blob, fileName + '.csv');

    }, error => {

      console.error('Error downloading the report', error);
    }

    );
  }

  generateDigitalEscrowStatement(reportBody: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url = environment.ReportServiceHost + '/report/escrow';
    if (this.isAdmin) url = environment.ReportServiceHost + '/super-admin/report/escrow';
    return this.httpClient.post<any>(url, reportBody);
  }
}

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import banksTypes from '@modules/accounts/constants/banksTypes';
import { AuthService } from '@modules/auth/services';
import {
  BankAccount,
  BankAccountAgreement
} from '@modules/bank-account/models';
import { environment } from 'environments/environment';
import { BehaviorSubject, forkJoin, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable()
export class BankAccountService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _bankStatements$ = new BehaviorSubject<BankAccount[]>([]);
  private _balance$ = new BehaviorSubject<number[]>([]);
  private _total$ = new BehaviorSubject<number | undefined>(undefined);
  private bankAccountNoSource = new BehaviorSubject<string>('');
  bankAccountNo$ = this.bankAccountNoSource.asObservable();

  isAdmin!: boolean;

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) { }

  get bankStatement$() {
    return this._bankStatements$.asObservable();
  }

  get loading$() {
    return this._loading$.asObservable();
  }

  get total$(): Observable<number | undefined> {
    return this._total$.asObservable();
  }

  get balance$() {
    return this._balance$.asObservable();
  }

  retrieveBankAccounts(
    isAdmin: boolean,
    merchantId: string | null,
    param: any,
    bankNames?: string[],
    sort?: Record<string, number>
  ) {
    const httpHeaders = new HttpHeaders({
      'content-type': 'application/json'
    });
    this._loading$.next(true);
    const params = {} as any;
    if (merchantId) params.merchantId = merchantId;
    if (bankNames) {
      params.bankNames = JSON.stringify(bankNames).toLowerCase();
    }
    if (param.page) {
      params.page = param.page;
    }

    if (param.selectedBank) {
      if (param.selectedBank.toLowerCase() === 'yes') {
        params.bank = banksTypes.YES_BANK;
      } else {
        params.bank = param.selectedBank.toLowerCase();
      }
    }

    if (param.s) {
      params.s = param.s;
    }

    if (param.refreshAll) {
      params.refreshAll = true;
    }

    let url = environment.apiPrefix + '/bank-account';
    if (isAdmin) {
      url = environment.apiPrefix + '/super-admin/bank-account';
    }

    return this.httpClient
      .get<any>(url, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          this._bankStatements$.next(resp.result);
          this._loading$.next(false);
          this._total$.next(resp.allItemsCount);
          return resp.result;
        })
      );
  }

  uploadBankAccountDocument(bankAccountNo: string, formData: FormData) {
    console.log('adding document to the account');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post<BankAccountAgreement>(
      `${environment.apiPrefix}/super-admin/bank-account/${bankAccountNo}/document`,
      formData
    );
  }

  getBalance(
    isAdmin: boolean,
    merchantId: string | null,
    bankNames?: string[]
  ) {
    const httpHeaders = new HttpHeaders({
      'content-type': 'application/json'
    });

    const params = {} as any;
    params.merchantId = merchantId;
    if (bankNames) {
      params.bankNames = JSON.stringify(bankNames).toLowerCase();
    }

    let url = environment.apiPrefix + '/bank-account/total-balance';
    if (isAdmin) {
      url = environment.apiPrefix + '/super-admin/bank-account/total-balance';
    }
    return this.httpClient
      .get<any>(url, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map(resp => {
          this._balance$.next(resp.result);
          return resp;
        })
      );
  }

  updateReportDownloadLink(page: number, merchantId: string = '') {
    const params = {
      token: this.authService.getBearerToken(),
      page: page || 1
    } as Params;

    if (merchantId !== '') {
      params.merchantId = merchantId;
    }
    let paramsSerialized = '';

    for (const [key, value] of Object.entries(params)) {
      if (paramsSerialized.length > 0) {
        paramsSerialized += '&';
      }
      paramsSerialized += `${key}=${value}`;
    }
    let newLink;

    this.authService.isSuperAdmin()
      ? (newLink =
        environment.apiPrefix +
        '/super-admin/bank-account/report/download?' +
        paramsSerialized)
      : (newLink =
        environment.apiPrefix +
        '/bank-account/report/download?' +
        paramsSerialized);

    // if (!paramsSerialized || this.reportDownloadLink$.getValue() === newLink) {
    //       return;
    //     }
    // Set the generated New Link
    return newLink;
  }

  getActiveBalance(
    merchantId: string | null,
    bankAccountNo: string,
    bankName: string,
    isAdmin: boolean = false,
    fetchBal: boolean = true
  ) {
    const httpHeaders = new HttpHeaders({
      'content-type': 'application/json'
    });

    let params = new HttpParams();
    params = params.set('merchantId', merchantId as string);
    params = params.set('bankAccountId', (bankAccountNo as unknown) as string);
    params = params.set('bankName', bankName as string);
    params = params.set('fetchBal', (fetchBal as unknown) as string);
    let url = environment.apiPrefix + `/bank-account/${bankAccountNo}/balance`;
    if (isAdmin) {
      url =
        environment.apiPrefix +
        `/super-admin/bank-account/${bankAccountNo}/balance`;
    }
    return this.httpClient.get<any>(url, {
      headers: httpHeaders,
      params
    });
  }

  updateBankAccountNo(bankAccountNo: string) {
    this.bankAccountNoSource.next(bankAccountNo);
  }

  getCombinedData(
    isAdmin: boolean,
    merchantId: string | null,
    param: any
  ): Observable<any[]> {
    if (Boolean(param.isAdmin)) {
      return this.retrieveBankAccounts(isAdmin, merchantId, param);
    }
    return this.retrieveBankAccounts(isAdmin, merchantId, param).pipe(
      switchMap(initialData => {
        const requests = initialData.map((item: any) =>
          this.getActiveBalance(
            merchantId,
            item.bankAccountNo,
            item.bankName,
            param.isAdmin,
            param.fetchBal
          ).pipe(
            map((effectiveBalance: any) => ({
              ...item,
              effectiveBalance: effectiveBalance.result.effectiveBalance
            }))
          )
        );
        return forkJoin(requests);
      })
    );
  }

  fetchAccount(isAdmin: boolean, filters: any) {
    const httpHeaders = new HttpHeaders({
      'content-type': 'application/json'
    });

    let bankAccountNo;
    if (filters.bankAccountNo) {
      bankAccountNo = filters.bankAccountNo;
    }
    let url = environment.apiPrefix + `/bank-account/${bankAccountNo}`;
    if (isAdmin) {
      url =
        environment.apiPrefix + `/super-admin/bank-account/${bankAccountNo}`;
    }

    return this.httpClient
      .get<any>(url, {
        headers: httpHeaders
      })
      .pipe(
        switchMap(initialData => {
          console.log(initialData);
          const bankAccount = [initialData.result];
          const requests = bankAccount.map((item: any) =>
            this.getActiveBalance(
              item.merchantId,
              item.bankAccountNo,
              item.bankName,
              this.isAdmin
            ).pipe(
              map((effectiveBalance: any) => ({
                ...item,
                effectiveBalance: effectiveBalance.result.effectiveBalance
              }))
            )
          );
          return forkJoin(requests);
        })
      );
  }

  linkParty(inputs: any) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const params = new HttpParams();

    const url = environment.apiPrefix + `/super-admin/escrow-parties`;
    return this.httpClient.post<any>(url, inputs, { headers: httpHeaders });
  }

  deleteDocument(bankAccountNo: string, docId: string) {
    console.log('deleting document from the account');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.delete(
      `${environment.apiPrefix}/super-admin/bank-account/${bankAccountNo}/document/${docId}`
    );
  }

  getBankAccountDocs(bankAccountNo: string) {
    // this.page = 1
    let url = `${environment.apiPrefix}/bank-account/${bankAccountNo}/document`;
    if (this.authService.isSuperAdmin()) {
      url = `${environment.apiPrefix}/super-admin/bank-account/${bankAccountNo}/document`;
    }
    // this._search$.next();
    console.log('Retrieving payee Data');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enable the loading text
    this._loading$.next(true);

    // Prepare Params
    // tslint:disable-next-line:no-any
    const params: any = {};

    return this.httpClient
      .get<BankAccountAgreement>(url, {
        headers: httpHeaders,
        params
      })
      .pipe(
        map((resp: any) => {
          if (resp.success) {
            try {
              // Update the entries
              resp.result.filter((doc: BankAccountAgreement) => {
                // doc.fileURL = this.getDownloadURL(doc.hash);
                return doc;
              });
            } catch (e) {
              console.error(e);
            }
          }
          // Disable the Loading text before returning anything
          // this._loading$.next(false);
          return resp;
        }),
        catchError(err => {
          console.error(err);
          // Disable the Loading text before returning anything
          // this._loading$.next(false);
          return throwError(err);
        })
      );
  }

  getLinkedParty(isAdmin: boolean, accountNo: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let url =
      environment.apiPrefix + `/bank-account/${accountNo}/escrow-parties`;

    if (isAdmin) {
      url =
        environment.apiPrefix +
        `/super-admin/bank-account/${accountNo}/escrow-parties`;
    }
    return this.httpClient.get<any>(url, { headers: httpHeaders });
  }

  deleteParty(escrowPartyId: string) {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const url =
      environment.apiPrefix + `/super-admin/escrow-parties/${escrowPartyId}`;
    return this.httpClient.delete<any>(url, { headers: httpHeaders });
  }

  uploadDocument(accountId: string, formData: FormData) {
    console.log('adding document to the account');
    // Hit the call on server
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient.post<any>(
      `${environment.apiPrefix}/account/${accountId}/document`,
      formData
    );
  }
}
